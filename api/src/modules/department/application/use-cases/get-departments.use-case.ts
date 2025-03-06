import { Inject, Injectable, Logger } from '@nestjs/common';
import { DEPARTMENT_REPOSITORY, DepartmentRepository } from '../../domain/ports/department.repository';
import { DepartmentEntity } from '../../domain/entities/department.entity';

@Injectable()
export class GetDepartmentsUseCase {
  private readonly logger = new Logger(GetDepartmentsUseCase.name);

  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: DepartmentRepository
  ) {}

  async execute(): Promise<DepartmentEntity[]> {
    this.logger.debug('Getting all departments');
    return this.departmentRepository.findAll();
  }
}