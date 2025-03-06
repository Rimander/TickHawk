import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DepartmentCreatedEvent } from './department-created.event';
import { DepartmentUpdatedEvent } from './department-updated.event';
import { DepartmentDeletedEvent } from './department-deleted.event';

@Injectable()
export class DepartmentEventListener {
  private readonly logger = new Logger(DepartmentEventListener.name);

  @OnEvent('department.created')
  handleDepartmentCreatedEvent(event: DepartmentCreatedEvent): void {
    this.logger.debug(`[Event] Department created: ${JSON.stringify({
      id: event.departmentId,
      name: event.departmentData.name
    })}`);
    
    // Esta escucha puede extenderse para realizar acciones cuando se crea un departamento
    // Por ejemplo, crear roles predeterminados, notificar a administradores, etc.
  }

  @OnEvent('department.updated')
  handleDepartmentUpdatedEvent(event: DepartmentUpdatedEvent): void {
    this.logger.debug(`[Event] Department updated: ${JSON.stringify({
      id: event.departmentId,
      updates: event.updates
    })}`);
    
    // Esta escucha puede extenderse para realizar acciones cuando se actualiza un departamento
    // Por ejemplo, actualizar registros relacionados en otros dominios, enviar notificaciones, etc.
  }

  @OnEvent('department.deleted')
  handleDepartmentDeletedEvent(event: DepartmentDeletedEvent): void {
    this.logger.debug(`[Event] Department deleted: ${JSON.stringify({
      id: event.departmentId,
      name: event.departmentData.name
    })}`);
    
    // Esta escucha puede extenderse para realizar acciones de limpieza cuando se elimina un departamento
    // Por ejemplo, eliminar registros relacionados, notificar a usuarios, archivar datos, etc.
  }
}