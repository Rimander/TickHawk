import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from 'src/config/guard/roles/roles.guard';
import { JWTGuard } from 'src/config/guard/jwt/jwt.guard';
import { Roles } from 'src/config/guard/roles/roles.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { CreateDepartmentDto } from '../dtos/in/create-department.dto';
import { DepartmentDto } from '../dtos/out/department.dto';

import { CreateDepartmentUseCase } from '../../application/use-cases/create-department.use-case';
import { GetDepartmentsUseCase } from '../../application/use-cases/get-departments.use-case';
import { GetDepartmentUseCase } from '../../application/use-cases/get-department.use-case';
import { UpdateDepartmentUseCase } from '../../application/use-cases/update-department.use-case';
import { DeleteDepartmentUseCase } from '../../application/use-cases/delete-department.use-case';
import { GetDepartmentUsersUseCase } from '../../application/use-cases/get-department-users.use-case';
import { AssignUserUseCase } from '../../application/use-cases/assign-user.use-case';
import { RemoveUserUseCase } from '../../application/use-cases/remove-user.use-case';

@Controller('department')
@UseGuards(JWTGuard, RolesGuard)
@ApiTags('Department')
export class DepartmentController {
  constructor(
    private readonly createDepartmentUseCase: CreateDepartmentUseCase,
    private readonly getDepartmentsUseCase: GetDepartmentsUseCase,
    private readonly getDepartmentUseCase: GetDepartmentUseCase,
    private readonly updateDepartmentUseCase: UpdateDepartmentUseCase,
    private readonly deleteDepartmentUseCase: DeleteDepartmentUseCase,
    private readonly getDepartmentUsersUseCase: GetDepartmentUsersUseCase,
    private readonly assignUserUseCase: AssignUserUseCase,
    private readonly removeUserUseCase: RemoveUserUseCase
  ) {}

  /**
   * Create a department
   * @param createDepartmentDto The department data 
   * @returns The created department
   */
  @Post()
  @Roles(['admin'])
  @ApiOperation({ summary: 'Create a new department' })
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    await this.createDepartmentUseCase.execute(createDepartmentDto);
    return HttpStatus.CREATED;
  }

  /**
   * Get all departments
   * @returns List of departments
   */
  @Get()
  @Roles(['admin', 'agent', 'customer'])
  @ApiOperation({ summary: 'Get all departments' })
  async findAll(): Promise<DepartmentDto[]> {
    const departments = await this.getDepartmentsUseCase.execute();
    
    // Transformación para asegurar que _id esté presente en cada departamento
    const transformedDepartments = departments.map(department => ({
      ...department,
      _id: department._id || department.id
    }));
    
    return plainToInstance(DepartmentDto, transformedDepartments, { 
      excludeExtraneousValues: true 
    });
  }

  /**
   * Get department by id
   * @param id Department id
   * @returns Department
   */
  @Get(':id')
  @Roles(['admin', 'agent'])
  @ApiOperation({ summary: 'Get department by id' })
  async findOne(@Param('id') id: string): Promise<DepartmentDto> {
    const department = await this.getDepartmentUseCase.execute(id);
    
    return plainToInstance(DepartmentDto, {
      ...department,
      _id: department._id || department.id
    }, { 
      excludeExtraneousValues: true 
    });
  }

  /**
   * Update department
   * @param id Department id
   * @param updateDepartmentDto Department data
   * @returns Updated department
   */
  @Put(':id')
  @Roles(['admin'])
  @ApiOperation({ summary: 'Update a department' })
  async update(
    @Param('id') id: string, 
    @Body() updateDepartmentDto: CreateDepartmentDto
  ): Promise<DepartmentDto> {
    const department = await this.updateDepartmentUseCase.execute(id, updateDepartmentDto);
    
    return plainToInstance(DepartmentDto, {
      ...department,
      _id: department._id || department.id
    }, { 
      excludeExtraneousValues: true 
    });
  }

  /**
   * Delete department
   * @param id Department id
   * @returns Status
   */
  @Delete(':id')
  @Roles(['admin'])
  @ApiOperation({ summary: 'Delete a department' })
  async remove(@Param('id') id: string) {
    await this.deleteDepartmentUseCase.execute(id);
    return { message: 'DEPARTMENT_DELETED' };
  }

  /**
   * Get users from department
   * @param id Department id
   * @returns List of users
   */
  @Get(':id/users')
  @Roles(['admin'])
  @ApiOperation({ summary: 'Get all users from a department' })
  async getDepartmentUsers(@Param('id') id: string) {
    return await this.getDepartmentUsersUseCase.execute(id);
  }

  /**
   * Add user to department
   * @param departmentId Department id
   * @param userId User id
   * @returns Status
   */
  @Post(':departmentId/user/:userId')
  @Roles(['admin'])
  @ApiOperation({ summary: 'Assign a user to a department' })
  async assignUserToDepartment(
    @Param('departmentId') departmentId: string,
    @Param('userId') userId: string
  ) {
    const result = await this.assignUserUseCase.execute(departmentId, userId);
    return { success: result, message: 'USER_ASSIGNED_TO_DEPARTMENT' };
  }

  /**
   * Remove user from department
   * @param departmentId Department id
   * @param userId User id
   * @returns Status
   */
  @Delete(':departmentId/user/:userId')
  @Roles(['admin'])
  @ApiOperation({ summary: 'Remove a user from a department' })
  async removeUserFromDepartment(
    @Param('departmentId') departmentId: string,
    @Param('userId') userId: string
  ) {
    const result = await this.removeUserUseCase.execute(departmentId, userId);
    return { success: result, message: 'USER_REMOVED_FROM_DEPARTMENT' };
  }
}