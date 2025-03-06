import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DEPARTMENT_REPOSITORY, DepartmentRepository } from '../../domain/ports/department.repository';

@Injectable()
export class GetDepartmentUsersUseCase {
  private readonly logger = new Logger(GetDepartmentUsersUseCase.name);

  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: DepartmentRepository
  ) {}

  async execute(departmentId: string): Promise<any[]> {
    this.logger.debug(`Getting users for department with ID: ${departmentId}`);

    const department = await this.departmentRepository.findById(departmentId);
    
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return this.departmentRepository.getUsers(departmentId);
  }
}