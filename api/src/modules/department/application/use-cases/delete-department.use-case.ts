import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DEPARTMENT_REPOSITORY, DepartmentRepository } from '../../domain/ports/department.repository';
import { DepartmentDeletedEvent } from '../events/department-deleted.event';

@Injectable()
export class DeleteDepartmentUseCase {
  private readonly logger = new Logger(DeleteDepartmentUseCase.name);

  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: DepartmentRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(id: string): Promise<boolean> {
    this.logger.debug(`Deleting department with ID: ${id}`);

    // Buscar departamento primero para emitir evento con sus datos
    const department = await this.departmentRepository.findById(id);
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Verificar que no tenga usuarios asignados
    const hasUsers = await this.departmentRepository.hasUsers(id);
    if (hasUsers) {
      throw new BadRequestException('Cannot delete department with assigned users');
    }

    // Eliminar departamento del repositorio
    const isDeleted = await this.departmentRepository.delete(id);

    if (isDeleted) {
      // Emitir evento de eliminación
      this.eventEmitter.emit(
        'department.deleted',
        new DepartmentDeletedEvent(
          id,
          { name: department.name }
        )
      );
    }

    return isDeleted;
  }
}