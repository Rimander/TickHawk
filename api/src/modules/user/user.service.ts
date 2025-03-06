import { Injectable, Logger } from '@nestjs/common';
import {
  BadRequestException,
  ConflictException,
  InternalServerException,
  NotFoundException
} from 'src/common/exceptions';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { ProfileDto } from './dtos/out/profile.dto';
import { plainToInstance } from 'class-transformer';
import { AssignDepartmentDto } from './dtos/in/assign-department.dto';
import { CreateUserDto } from './dtos/in/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { UpdateProfileDto } from './dtos/in/update-profile.dto';
import { UserListDto } from './dtos/out/user-list.dto';
import { AssignCompanyDto } from './dtos/in/assign-company.dto';
import { DeleteFileUseCase } from '../file/application/use-cases/delete-file.use-case';
import { FileExistsUseCase } from '../file/application/use-cases/file-exists.use-case';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserUpdatedEvent } from './events/user-updated.event';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly deleteFileUseCase: DeleteFileUseCase,
    private readonly fileExistsUseCase: FileExistsUseCase,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Exist user in database
   * For init data propuse
   */
  async exist(): Promise<boolean> {
    try {
      this.logger.debug('Checking if any users exist in the system');
      const exists = (await this.userModel.findOne()) !== null;
      this.logger.debug(`User existence check result: ${exists}`);
      return exists;
    } catch (error) {
      this.logger.error(`Error checking user existence: ${error.message}`, error.stack);
      throw new InternalServerException('Error checking user existence', 'USER_EXISTENCE_CHECK_FAILED');
    }
  }

  /**
   * Find a user by username
   * @param email
   * @returns
   */
  async findOne(email: string): Promise<User> {
    try {
      this.logger.debug(`Finding user by email: ${email}`);
      const user = await this.userModel.findOne({ email: email });
      
      if (user) {
        this.logger.debug(`User found with ID: ${user._id}`);
      } else {
        this.logger.debug(`No user found with email: ${email}`);
      }
      
      return user;
    } catch (error) {
      this.logger.error(`Error finding user by email: ${error.message}`, error.stack);
      throw new InternalServerException('Error finding user by email', 'USER_FIND_FAILED');
    }
  }

  /**
   * Find a user by id and return a profile dto
   * @param id
   * @returns
   */
  async findById(id: Types.ObjectId): Promise<ProfileDto> {
    try {
      this.logger.debug(`Finding user by ID: ${id}`);
      
      const user = await this.userModel.findById(id);
      if (!user) {
        this.logger.warn(`User not found with ID: ${id}`);
        throw new NotFoundException('User not found', 'USER_NOT_FOUND');
      }
      
      this.logger.debug(`User ${id} found successfully`);
      return plainToInstance(ProfileDto, user.toJSON(), {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      this.logger.error(`Error finding user by ID ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerException('Error finding user', 'USER_FIND_FAILED');
    }
  }

  /**
   * Find all users with filtering and pagination
   * @param options
   * @returns
   */
  async findAll(options: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
  }): Promise<UserListDto> {
    try {
      this.logger.debug(`Finding users with filters: ${JSON.stringify(options)}`);
      
      const filter: any = {};
      
      // Apply search filter if provided
      if (options.search) {
        this.logger.debug(`Applying search filter: "${options.search}"`);
        filter.$or = [
          { name: { $regex: options.search, $options: 'i' } },
          { email: { $regex: options.search, $options: 'i' } },
        ];
      }
      
      // Apply role filter if provided
      if (options.role) {
        this.logger.debug(`Filtering by role: ${options.role}`);
        filter.role = options.role;
      }
      
      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;
      
      this.logger.debug(`Pagination: page=${page}, limit=${limit}, skip=${skip}`);
      
      // Run queries in parallel for better performance
      const [users, total] = await Promise.all([
        this.userModel.find(filter)
          .populate('companyId', 'name') // Populate the company information
          .skip(skip)
          .limit(limit)
          .lean(),
        this.userModel.countDocuments(filter),
      ]);
      
      this.logger.debug(`Found ${users.length} users, total count: ${total}`);
      
      // Map users and add company object for frontend
      const mappedUsers = users.map(user => {
        // Create a user object with ProfileDto fields
        const userDto = plainToInstance(ProfileDto, user, { 
          excludeExtraneousValues: true 
        });
        
        // Add company object if companyId exists and is populated
        if (user.companyId && typeof user.companyId === 'object' && 'name' in user.companyId) {
          // Type assertion to make TypeScript happy
          const companyData = user.companyId as { _id: Types.ObjectId; name: string };
          
          // @ts-ignore - Add company property to match frontend model
          userDto.company = {
            _id: companyData._id.toString(),
            name: companyData.name
          };
        }
        
        return userDto;
      });
      
      this.logger.debug('Successfully mapped user data with company information');
      
      return plainToInstance(
        UserListDto,
        {
          users: mappedUsers,
          total,
          page,
          limit,
        },
        { excludeExtraneousValues: true },
      );
    } catch (error) {
      this.logger.error(`Error finding users: ${error.message}`, error.stack);
      throw new InternalServerException('Error retrieving user list', 'USER_LIST_RETRIEVAL_FAILED');
    }
  }

  /**
   * Assign a department to a user by id
   * @param assignDepartmentDto
   * @returns
   */
  async assignDepartment(
    assignDepartmentDto: AssignDepartmentDto,
  ): Promise<boolean> {
    const update = await this.userModel.updateOne(
      { _id: assignDepartmentDto.userId },
      { $push: { departments: assignDepartmentDto.departmentId } },
    );
    return update.modifiedCount > 0;
  }

  /**
   * Assign a company to a customer user
   * @param assignCompanyDto
   * @returns
   */
  async assignCompany(
    assignCompanyDto: AssignCompanyDto,
  ): Promise<ProfileDto> {
    // Get the user
    const user = await this.userModel.findById(assignCompanyDto.userId);
    if (!user) {
      throw new NotFoundException('User not found', 'USER_NOT_FOUND');
    }
    
    // Check if user is a customer - removed restriction to allow all roles
    // This allows admins and agents to be associated with companies too
    
    // Update the user - either set or unset the companyId
    if (assignCompanyDto.companyId) {
      await this.userModel.updateOne(
        { _id: assignCompanyDto.userId },
        { companyId: assignCompanyDto.companyId },
      );
    } else {
      // If companyId is null or undefined, remove the companyId field
      await this.userModel.updateOne(
        { _id: assignCompanyDto.userId },
        { $unset: { companyId: 1 } },
      );
    }
    
    // Return updated user
    const updatedUser = await this.userModel.findById(assignCompanyDto.userId);
    return plainToInstance(ProfileDto, updatedUser.toJSON(), {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Get profile image
   * @param id
   * @returns
   */
  async getProfileImage(id: string): Promise<Buffer> {
    // This method needs to be updated to use the new architecture
    throw new InternalServerException('Method not implemented with new architecture', 'METHOD_NOT_IMPLEMENTED');
  }

  /**
   * Create a new user
   * @param user CreateUserDto
   */
  async create(user: CreateUserDto): Promise<User> {
    if (!user.password) {
      //TODO: Add block user if password is empty
      throw new BadRequestException('Password is required', 'PASSWORD_REQUIRED');
    } else {
      user.password = bcrypt.hashSync(user.password, 10);
    }

    //TODO: PlaintoInstance
    return await this.userModel.create(new this.userModel(user));
  }
  
  /**
   * Create a new user and return ProfileDto
   * @param createUserDto 
   * @returns 
   */
  async createUser(createUserDto: CreateUserDto): Promise<ProfileDto> {
    // Check if email is already in use
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('Email is already in use', 'EMAIL_ALREADY_IN_USE');
    }
    
    // Create the user
    const user = await this.create(createUserDto);
    
    // Return user profile
    return plainToInstance(ProfileDto, user.toJSON(), {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Update a user by id
   * @param profile
   * @returns
   */
  async update(profile: UpdateProfileDto): Promise<ProfileDto> {
    if (profile.password) {
      profile.password = bcrypt.hashSync(profile.password, 10);
    } else {
      delete profile.password;
    }

    const user = await this.userModel.findById(profile._id);
    if (!user) {
      throw new NotFoundException('User not found', 'USER_NOT_FOUND');
    }

    // Determine what fields have changed for the event
    const updates = {
      name: profile.name !== user.name ? profile.name : undefined,
      email: profile.email !== user.email ? profile.email : undefined,
    };

    await this.userModel.updateOne({ _id: profile._id }, profile);

    // If user data relevant to tickets has changed, emit an event
    if (updates.name || updates.email) {
      this.logger.debug(`Emitting user update event for user ${profile._id}`);
      this.eventEmitter.emit(
        'user.updated', 
        new UserUpdatedEvent(profile._id.toString(), updates)
      );
    }

    const newUser = await this.userModel.findById(profile._id);
    return plainToInstance(ProfileDto, newUser.toJSON(), {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Update a user profile with file upload
   * @param id 
   * @param updateProfileDto 
   * @param file 
   * @returns 
   */
  async updateProfile(
    id: string, 
    updateProfileDto: UpdateProfileDto, 
    file?: Express.Multer.File
  ): Promise<ProfileDto> {    
    // Handle profile image upload if provided
    if (file) {
      // Note: We need to fix this to use uploadFileUseCase
      // This is a temporary workaround
      throw new BadRequestException('Profile image upload not supported temporarily', 'PROFILE_IMAGE_UPLOAD_DISABLED');
    }
    
    return this.update(updateProfileDto);
  }
  
  /**
   * Remove profile image for a user
   * @param id User ID
   * @returns Updated user profile
   */
  async removeProfileImage(id: Types.ObjectId): Promise<ProfileDto> {
    try {
      this.logger.debug(`Removing profile image for user: ${id}`);

      // Get current user
      const user = await this.userModel.findById(id);
      if (!user) {
        this.logger.warn(`User not found with ID: ${id}`);
        throw new NotFoundException('User not found', 'USER_NOT_FOUND');
      }

      // Remove image from storage provider
      await this.deleteFileUseCase.execute(user._id.toString());

      // Update user profile image field
      this.logger.debug(`Profile image removed for user: ${id}`);

      return plainToInstance(ProfileDto, user.toJSON(), {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      this.logger.error(`Error removing profile image: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerException('Failed to remove profile image', 'PROFILE_IMAGE_REMOVAL_FAILED');
    }
  }
}
