import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DEPARTMENT_REPOSITORY, DepartmentRepository } from '../../domain/ports/department.repository';
import { DepartmentEntity } from '../../domain/entities/department.entity';
import { DepartmentCreatedEvent } from '../events/department-created.event';

@Injectable()
export class CreateDepartmentUseCase {
  private readonly logger = new Logger(CreateDepartmentUseCase.name);

  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: DepartmentRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(departmentData: { name: string }): Promise<DepartmentEntity> {
    this.logger.debug(`Creating department with name: ${departmentData.name}`);

    // Crear entidad de departamento
    const department = new DepartmentEntity({
      name: departmentData.name
    });

    try {
      // Guardar departamento en repositorio
      const createdDepartment = await this.departmentRepository.create(department);

      // Emitir evento de creación
      this.eventEmitter.emit(
        'department.created',
        new DepartmentCreatedEvent(
          createdDepartment.id,
          { name: createdDepartment.name }
        )
      );

      return createdDepartment;
    } catch (error) {
      this.logger.error(`Error creating department: ${error.message}`, error.stack);
      throw error;
    }
  }
}