import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket } from '../schemas/ticket.schema';
import { CompanyTicket } from '../schemas/company-ticket.schema';

/**
 * Listener para eventos de compañía en el dominio de Tickets
 * Este listener responde a eventos emitidos por el dominio de Company
 * y actualiza los tickets según sea necesario.
 */
@Injectable()
export class CompanyEventsListener {
  private readonly logger = new Logger(CompanyEventsListener.name);

  constructor(
    @InjectModel(Ticket.name) private readonly ticketModel: Model<Ticket>
  ) {}

  /**
   * Cuando una compañía es actualizada, actualiza sus datos en todos los tickets relacionados
   */
  @OnEvent('company.updated')
  async handleCompanyUpdatedEvent(event: { 
    companyId: string; 
    updates: { name?: string; email?: string } 
  }): Promise<void> {
    this.logger.debug(`Ticket module received company.updated event for company: ${event.companyId}`);
    
    const updateFields = {};
    
    if (event.updates.name) {
      updateFields['company.name'] = event.updates.name;
    }
    
    if (event.updates.email) {
      updateFields['company.email'] = event.updates.email;
    }
    
    // Solo realizar la actualización si hay campos para actualizar
    if (Object.keys(updateFields).length > 0) {
      try {
        const result = await this.ticketModel.updateMany(
          { 'company._id': event.companyId },
          { $set: updateFields }
        );
        
        this.logger.debug(`Updated ${result.modifiedCount} tickets with new company information`);
      } catch (error) {
        this.logger.error(`Error updating tickets after company update: ${error.message}`, error.stack);
      }
    }
  }

  /**
   * Cuando una compañía es eliminada, marca los tickets relacionados como "huérfanos"
   * o realiza otra acción según la lógica de negocio
   */
  @OnEvent('company.deleted')
  async handleCompanyDeletedEvent(event: { 
    companyId: string; 
    companyData: { name: string; email: string } 
  }): Promise<void> {
    this.logger.debug(`Ticket module received company.deleted event for company: ${event.companyId}`);
    
    try {
      // Aquí podrías implementar la lógica para manejar tickets de una compañía eliminada
      // Por ejemplo:
      // - Marcar tickets como archivados
      // - Mover tickets a una compañía predeterminada
      // - Borrar tickets (no recomendado generalmente)
      
      // Este es solo un ejemplo, la implementación dependería de los requisitos específicos
      const result = await this.ticketModel.updateMany(
        { 'company._id': event.companyId },
        { 
          $set: { 
            status: 'archived',
            'company.name': `${event.companyData.name} (Deleted)`,
            'company.deleted': true
          } 
        }
      );
      
      this.logger.debug(`Archived ${result.modifiedCount} tickets after company deletion`);
    } catch (error) {
      this.logger.error(`Error handling tickets after company deletion: ${error.message}`, error.stack);
    }
  }
}