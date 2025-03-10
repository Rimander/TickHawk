import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ServiceException } from 'src/common/exceptions';
import { FileInterceptor } from '@nestjs/platform-express';
import { JWTGuard } from 'src/config/guard/jwt/jwt.guard';
import { Roles } from 'src/config/guard/roles/roles.decorator';
import { RolesGuard } from 'src/config/guard/roles/roles.guard';
import { Request } from 'express';
import { Types } from 'mongoose';
import { ApiConsumes, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Public } from 'src/config/public.decorator';

// DTOs
import { ProfileDto } from '../dtos/out/profile.dto';
import { UpdateProfileDto } from '../dtos/in/update-profile.dto';
import { UserListDto } from '../dtos/out/user-list.dto';
import { AssignCompanyDto } from '../dtos/in/assign-company.dto';
import { CreateUserDto } from '../dtos/in/create-user.dto';
import { AssignDepartmentDto } from '../dtos/in/assign-department.dto';

// Use Cases
import { GetUserUseCase } from '../../application/use-cases/get-user.use-case';
import { GetUsersUseCase } from '../../application/use-cases/get-users.use-case';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { AssignCompanyUseCase } from '../../application/use-cases/assign-company.use-case';
import { AssignDepartmentUseCase } from '../../application/use-cases/assign-department.use-case';

// File module use cases
import { GetFileUseCase } from '../../../file/application/use-cases/get-file.use-case';
import { DeleteFileUseCase } from '../../../file/application/use-cases/delete-file.use-case';
import { FileExistsUseCase } from '../../../file/application/use-cases/file-exists.use-case';

@Controller('user')
@UseGuards(JWTGuard, RolesGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);
  
  constructor(
    // User use cases
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly assignCompanyUseCase: AssignCompanyUseCase,
    private readonly assignDepartmentUseCase: AssignDepartmentUseCase,
    
    // File use cases
    private readonly getFileUseCase: GetFileUseCase,
    private readonly deleteFileUseCase: DeleteFileUseCase,
    private readonly fileExistsUseCase: FileExistsUseCase,
  ) {}

  /**
   * Get user data by id
   * @param request
   * @returns
   */
  @Get('/me')
  @Roles(['customer', 'admin', 'agent'])
  @ApiOperation({ summary: 'Get user data by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User data retrieved successfully',
    type: ProfileDto,
  })
  async getMe(@Req() request: Request): Promise<ProfileDto> {
    try {
      const userData = request.user;
      const id = userData.id as string;
      const user = await this.getUserUseCase.execute(id);
      return new ProfileDto(user);
    } catch (error) {
      this.logger.error(`Error retrieving user profile: ${error.message}`);
      
      if (error instanceof ServiceException) {
        // Map service exceptions to HTTP exceptions
        throw new HttpException({
          message: error.message,
          code: error.code
        }, error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
      }
      
      // For any other errors
      throw new HttpException('Failed to retrieve user profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('/me')
  @Roles(['customer', 'admin', 'agent'])
  @ApiOperation({ summary: 'Update user data by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User data updated successfully',
    type: ProfileDto,
  })
  async updateMe(
    @Req() request: Request,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileDto> {
    const userData = request.user;
    const id = userData.id as string;
    const user = await this.updateUserUseCase.execute(id, updateProfileDto);
    return new ProfileDto(user);
  }

  /**
   * Assign department to user by id
   * @param assignDepartmentDto
   * @returns
   */
  @Post('/assign-department')
  @Roles(['admin'])
  @ApiOperation({ summary: 'Assign department to user by id' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Department assigned successfully',
  })
  async assign(@Body() assignDepartmentDto: AssignDepartmentDto) {
    await this.assignDepartmentUseCase.execute(
      assignDepartmentDto.userId.toString(), 
      assignDepartmentDto.departmentId.toString()
    );
    return HttpStatus.CREATED;
  }
  
  /**
   * Assign company to user by id (only for customer users)
   * @param assignCompanyDto
   * @returns
   */
  @Post('/assign-company')
  @Roles(['admin'])
  @ApiOperation({ summary: 'Assign company to user by id (only for customer users)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company assigned successfully',
    type: ProfileDto,
  })
  async assignCompany(@Body() assignCompanyDto: AssignCompanyDto): Promise<ProfileDto> {
    const user = await this.assignCompanyUseCase.execute(
      assignCompanyDto.userId.toString(),
      assignCompanyDto.companyId?.toString() || null
    );
    return new ProfileDto(user);
  }
  
  /**
   * Create a new user (admin only)
   * @param createUserDto
   * @returns
   */
  @Post()
  @Roles(['admin'])
  @ApiOperation({ summary: 'Create a new user (admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
    type: ProfileDto,
  })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<ProfileDto> {
    const user = await this.createUserUseCase.execute(createUserDto);
    return new ProfileDto(user);
  }

  /**
   * Get profile image by id
   * @param request
   * @returns
   */
  @Get('/profile/image/:id')
  @Public()
  @ApiOperation({ summary: 'Get profile image by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile image retrieved successfully',
  })
  async getImage(@Param('id') id: string, @Res() res) {
    // Import modules at the top level
    const fs = require('fs');
    const path = require('path');
    
    // Handle both development and production paths
    let defaultImagePath;
    try {
      // First try the production path (when compiled to dist)
      defaultImagePath = path.join(__dirname, '../../../../../assets/tickhawk.png');
      // Check if file exists at this path
      fs.accessSync(defaultImagePath, fs.constants.R_OK);
      this.logger.debug(`Using production assets path: ${defaultImagePath}`);
    } catch (err) {
      // Fallback to development path
      defaultImagePath = path.join(__dirname, '../../../../assets/tickhawk.png');
      this.logger.debug(`Using development assets path: ${defaultImagePath}`);
    }
    
    try {
      // First try to get the user to check if they have a profile image
      try {
        const user = await this.getUserUseCase.execute(id);
        
        // Check if the file exists before trying to retrieve it
        const fileExists = await this.fileExistsUseCase.execute(user.id);
        if (!fileExists) {
          this.logger.debug(
            `Profile image ID ${user.id} doesn't exist, returning default`,
          );
          const defaultImage = fs.readFileSync(defaultImagePath);
          res.writeHead(200, { 'Content-Type': 'image/png' });
          res.end(defaultImage);
          return;
        }
        
        // If user has a profile image that exists, try to get it
        try {
          const buffer = await this.getFileUseCase.execute(user.id);
          res.writeHead(200, { 'Content-Type': 'image/png' });
          res.end(buffer);
          return;
        } catch (fileError) {
          this.logger.warn(`Error getting profile image file: ${fileError.message}`);
          // Continue to default image if file retrieval fails
        }
      } catch (userError) {
        this.logger.warn(`Error finding user: ${userError.message}`);
        // If user lookup fails, try direct file lookup by ID
        
        // Check if the ID is a valid file ID
        const fileExists = await this.fileExistsUseCase.execute(id);
        if (fileExists) {
          try {
            // As a fallback, try direct file lookup (legacy behavior)
            const buffer = await this.getFileUseCase.execute(id);
            res.writeHead(200, { 'Content-Type': 'image/png' });
            res.end(buffer);
            return;
          } catch (directFileError) {
            this.logger.warn(`Direct file lookup failed: ${directFileError.message}`);
            // Continue to default image
          }
        } else {
          this.logger.debug(`ID ${id} is not a valid file ID, returning default`);
        }
      }
      
      // Default image if all above attempts fail
      this.logger.debug(`Returning default image for user ${id}`);
      const defaultImage = fs.readFileSync(defaultImagePath);
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(defaultImage);
      
    } catch (error) {
      this.logger.error(`Unexpected error in getImage: ${error.message}`);
      // Ultimate fallback - try both paths explicitly before giving up
      try {
        // First try production path
        try {
          const prodPath = path.join(__dirname, '../../../../../assets/tickhawk.png');
          const defaultImage = fs.readFileSync(prodPath);
          res.writeHead(200, { 'Content-Type': 'image/png' });
          res.end(defaultImage);
          return;
        } catch (prodError) {
          // Try development path
          const devPath = path.join(__dirname, '../../../../assets/tickhawk.png');
          const defaultImage = fs.readFileSync(devPath);
          res.writeHead(200, { 'Content-Type': 'image/png' });
          res.end(defaultImage);
          return;
        }
      } catch (fsError) {
        this.logger.error(`Could not read default profile image from any path: ${fsError.message}`);
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(Buffer.from('', 'base64'));
      }
    }
  }

  /**
   * Get all users with pagination and filtering
   * @param page
   * @param limit
   * @param search
   * @param role
   * @returns
   */
  @Get()
  @Roles(['admin'])
  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users retrieved successfully',
    type: UserListDto,
  })
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ): Promise<UserListDto> {
    const result = await this.getUsersUseCase.execute({
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
      search,
      role,
    });
    
    return new UserListDto({
      users: result.users.map(user => new ProfileDto(user)),
      total: result.total,
      page: result.page,
      limit: result.limit
    });
  }
  
  /**
   * Get a user by ID (admin only)
   * @param id User ID
   * @returns User profile data
   */
  @Get('/:id')
  @Roles(['admin'])
  @ApiOperation({ summary: 'Get a user by ID (admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User data retrieved successfully',
    type: ProfileDto,
  })
  async getUserById(@Param('id') id: string): Promise<ProfileDto> {
    const user = await this.getUserUseCase.execute(id);
    return new ProfileDto(user);
  }
  
  /**
   * Update a user by ID (admin only)
   * @param id User ID
   * @param updateProfileDto Update profile data
   * @returns Updated user profile
   */
  @Put('/:id')
  @Roles(['admin'])
  @ApiOperation({ summary: 'Update a user by ID (admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
    type: ProfileDto,
  })
  async updateUser(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileDto> {
    const user = await this.updateUserUseCase.execute(id, updateProfileDto);
    return new ProfileDto(user);
  }
  
  /**
   * Delete profile image for a user
   * @param request
   * @returns Updated user profile
   */
  @Post('/me/remove-profile-image')
  @Roles(['customer', 'admin', 'agent'])
  @ApiOperation({ summary: 'Delete profile image for current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile image deleted successfully',
    type: ProfileDto,
  })
  async removeProfileImage(@Req() request: Request): Promise<ProfileDto> {
    const userData = request.user;
    const id = userData.id as string;
    
    // Delete profile image
    await this.deleteFileUseCase.execute(id);
    
    // Return updated user
    const user = await this.getUserUseCase.execute(id);
    return new ProfileDto(user);
  }
  
  /**
   * Delete profile image for any user (admin only)
   * @param id User ID
   * @returns Updated user profile
   */
  @Post('/:id/remove-profile-image')
  @Roles(['admin'])
  @ApiOperation({ summary: 'Delete profile image for any user (admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile image deleted successfully',
    type: ProfileDto,
  })
  async removeUserProfileImage(@Param('id') id: string): Promise<ProfileDto> {
    // Delete profile image
    await this.deleteFileUseCase.execute(id);
    
    // Return updated user
    const user = await this.getUserUseCase.execute(id);
    return new ProfileDto(user);
  }
  
  /**
   * Update a user with profile image (admin only)
   * @param id User ID
   * @param updateProfileDto Update profile data
   * @param file Profile image file
   * @returns Updated user profile
   */
  @Put('/:id/with-image')
  @Roles(['admin'])
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a user with profile image (admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
    type: ProfileDto,
  })
  async updateUserWithImage(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
    // @UploadedFile() file: Express.Multer.File,
  ): Promise<ProfileDto> {
    // Note: We need to implement file upload with the new architecture
    // This is a temporary implementation without file upload
    const user = await this.updateUserUseCase.execute(id, updateProfileDto);
    return new ProfileDto(user);
  }
}