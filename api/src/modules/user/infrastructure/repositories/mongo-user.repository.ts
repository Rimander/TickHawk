import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserRepository } from '../../domain/ports/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { User } from '../schemas/user.schema';
import { 
  ConflictException, 
  InternalServerException, 
  NotFoundException 
} from 'src/common/exceptions';

@Injectable()
export class MongoUserRepository implements UserRepository {
  private readonly logger = new Logger(MongoUserRepository.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  /**
   * Maps a Mongoose document to a domain entity
   */
  private mapToDomainEntity(userDoc: any): UserEntity {
    if (!userDoc) return null;

    // Convert Mongoose document to plain object if it's not already
    const user = userDoc.toObject ? userDoc.toObject() : userDoc;

    return new UserEntity({
      id: user._id.toString(),
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
      lang: user.lang,
      role: user.role,
      companyId: user.companyId ? user.companyId.toString() : undefined,
      departmentIds: user.departmentIds ? user.departmentIds.map(id => id.toString()) : [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  }

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

  async create(user: UserEntity): Promise<UserEntity> {
    try {
      // Check if user with this email already exists
      const existingUser = await this.userModel.findOne({ email: user.email });
      if (existingUser) {
        this.logger.warn(`User with email ${user.email} already exists`);
        throw new ConflictException('Email is already in use', 'EMAIL_ALREADY_IN_USE');
      }

      const newUser = new this.userModel({
        name: user.name,
        email: user.email,
        password: user.password,
        lang: user.lang || 'en',
        role: user.role || 'customer',
        companyId: user.companyId ? new Types.ObjectId(user.companyId) : undefined,
        departmentIds: user.departmentIds?.map(id => new Types.ObjectId(id)) || []
      });

      const savedUser = await newUser.save();
      return this.mapToDomainEntity(savedUser);
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      
      // Re-throw conflict exception
      if (error instanceof ConflictException) {
        throw error;
      }
      
      // Handle MongoDB duplicate key error
      if (error.code === 11000) {
        throw new ConflictException('Email is already in use', 'EMAIL_ALREADY_IN_USE');
      }
      
      throw new InternalServerException('Error creating user', 'USER_CREATE_FAILED');
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    try {
      this.logger.debug(`Finding user by ID: ${id}`);
      const user = await this.userModel.findById(new Types.ObjectId(id));
      
      if (user) {
        this.logger.debug(`User found with ID: ${id}`);
        return this.mapToDomainEntity(user);
      } else {
        this.logger.debug(`No user found with ID: ${id}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Error finding user by ID ${id}: ${error.message}`, error.stack);
      throw new InternalServerException('Error finding user by ID', 'USER_FIND_FAILED');
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      this.logger.debug(`Finding user by email: ${email}`);
      const user = await this.userModel.findOne({ email: email });
      
      if (user) {
        this.logger.debug(`User found with email: ${email}`);
        return this.mapToDomainEntity(user);
      } else {
        this.logger.debug(`No user found with email: ${email}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Error finding user by email: ${error.message}`, error.stack);
      throw new InternalServerException('Error finding user by email', 'USER_FIND_FAILED');
    }
  }

  async findAll(options?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    role?: string;
  }): Promise<{ 
    users: UserEntity[]; 
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      this.logger.debug(`Finding users with filters: ${JSON.stringify(options)}`);
      
      const filter: any = {};
      
      // Apply search filter if provided
      if (options?.search) {
        this.logger.debug(`Applying search filter: "${options.search}"`);
        filter.$or = [
          { name: { $regex: options.search, $options: 'i' } },
          { email: { $regex: options.search, $options: 'i' } },
        ];
      }
      
      // Apply role filter if provided
      if (options?.role) {
        this.logger.debug(`Filtering by role: ${options.role}`);
        filter.role = options.role;
      }
      
      const page = options?.page || 1;
      const limit = options?.limit || 10;
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
      
      return {
        users: users.map(user => this.mapToDomainEntity(user)),
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Error finding users: ${error.message}`, error.stack);
      throw new InternalServerException('Error retrieving user list', 'USER_LIST_RETRIEVAL_FAILED');
    }
  }

  async update(id: string, userData: Partial<UserEntity>): Promise<UserEntity | null> {
    try {
      this.logger.debug(`Updating user ${id}`);
      
      const user = await this.userModel.findById(new Types.ObjectId(id));
      if (!user) {
        this.logger.warn(`User not found with ID: ${id}`);
        throw new NotFoundException('User not found', 'USER_NOT_FOUND');
      }

      // Update user fields
      if (userData.name) user.name = userData.name;
      if (userData.email) user.email = userData.email;
      if (userData.password) user.password = userData.password;
      if (userData.lang) user.lang = userData.lang;
      if (userData.role) user.role = userData.role;
      
      const updatedUser = await user.save();
      return this.mapToDomainEntity(updatedUser);
    } catch (error) {
      this.logger.error(`Error updating user ${id}: ${error.message}`, error.stack);
      
      // Re-throw not found exception
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerException('Error updating user', 'USER_UPDATE_FAILED');
    }
  }

  async assignCompany(userId: string, companyId: string | null): Promise<UserEntity | null> {
    try {
      this.logger.debug(`Assigning company ${companyId} to user ${userId}`);
      
      const user = await this.userModel.findById(new Types.ObjectId(userId));
      if (!user) {
        this.logger.warn(`User not found with ID: ${userId}`);
        throw new NotFoundException('User not found', 'USER_NOT_FOUND');
      }

      // Update user - either set or unset the companyId
      if (companyId) {
        await this.userModel.updateOne(
          { _id: new Types.ObjectId(userId) },
          { companyId: new Types.ObjectId(companyId) },
        );
      } else {
        // If companyId is null, remove the companyId field
        await this.userModel.updateOne(
          { _id: new Types.ObjectId(userId) },
          { $unset: { companyId: 1 } },
        );
      }
      
      // Return updated user
      const updatedUser = await this.userModel.findById(new Types.ObjectId(userId));
      return this.mapToDomainEntity(updatedUser);
    } catch (error) {
      this.logger.error(`Error assigning company to user ${userId}: ${error.message}`, error.stack);
      
      // Re-throw not found exception
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerException('Error assigning company to user', 'USER_COMPANY_ASSIGNMENT_FAILED');
    }
  }

  async assignDepartment(userId: string, departmentId: string): Promise<boolean> {
    try {
      this.logger.debug(`Assigning department ${departmentId} to user ${userId}`);
      
      const update = await this.userModel.updateOne(
        { _id: new Types.ObjectId(userId) },
        { $addToSet: { departmentIds: new Types.ObjectId(departmentId) } },
      );
      
      return update.modifiedCount > 0;
    } catch (error) {
      this.logger.error(`Error assigning department to user ${userId}: ${error.message}`, error.stack);
      throw new InternalServerException('Error assigning department to user', 'USER_DEPARTMENT_ASSIGNMENT_FAILED');
    }
  }

  async removeDepartment(userId: string, departmentId: string): Promise<boolean> {
    try {
      this.logger.debug(`Removing department ${departmentId} from user ${userId}`);
      
      const update = await this.userModel.updateOne(
        { _id: new Types.ObjectId(userId) },
        { $pull: { departmentIds: new Types.ObjectId(departmentId) } },
      );
      
      return update.modifiedCount > 0;
    } catch (error) {
      this.logger.error(`Error removing department from user ${userId}: ${error.message}`, error.stack);
      throw new InternalServerException('Error removing department from user', 'USER_DEPARTMENT_REMOVAL_FAILED');
    }
  }
}