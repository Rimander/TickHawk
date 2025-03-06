import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DEPARTMENT_REPOSITORY, DepartmentRepository } from '../../domain/ports/department.repository';
import { DepartmentEntity } from '../../domain/entities/department.entity';
import { DepartmentUpdatedEvent } from '../events/department-updated.event';

@Injectable()
export class UpdateDepartmentUseCase {
  private readonly logger = new Logger(UpdateDepartmentUseCase.name);

  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: DepartmentRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(
    id: string, 
    updateData: { name: string }
  ): Promise<DepartmentEntity> {
    this.logger.debug(`Updating department with ID: ${id}`);

    // Buscar departamento
    const department = await this.departmentRepository.findById(id);
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Rastrear cambios para emitir en evento
    const changes = {};
    if (updateData.name && updateData.name !== department.name) {
      changes['name'] = updateData.name;
    }

    // Actualizar departamento en repositorio
    const updatedDepartment = await this.departmentRepository.update(id, updateData);

    // Emitir evento de actualización si hubo cambios
    if (Object.keys(changes).length > 0) {
      this.eventEmitter.emit(
        'department.updated',
        new DepartmentUpdatedEvent(id, changes)
      );
    }

    return updatedDepartment;
  }
}