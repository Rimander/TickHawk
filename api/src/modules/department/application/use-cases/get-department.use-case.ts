import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DEPARTMENT_REPOSITORY, DepartmentRepository } from '../../domain/ports/department.repository';
import { DepartmentEntity } from '../../domain/entities/department.entity';

@Injectable()
export class GetDepartmentUseCase {
  private readonly logger = new Logger(GetDepartmentUseCase.name);

  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: DepartmentRepository
  ) {}

  async execute(id: string): Promise<DepartmentEntity> {
    this.logger.debug(`Getting department with ID: ${id}`);

    const department = await this.departmentRepository.findById(id);
    
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }
}