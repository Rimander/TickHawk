import { Inject, Injectable, Logger } from '@nestjs/common';
import { TICKET_REPOSITORY, TicketRepository } from '../../domain/ports/ticket.repository';
import { TicketEntity, TicketStatus } from '../../domain/entities/ticket.entity';
import { ForbiddenException, NotFoundException } from 'src/common/exceptions';
import { EventEntity, EventType } from '../../domain/entities/event.entity';
import { UserRole, UserTicketEntity } from '../../domain/entities/user-ticket.entity';

/**
 * Use case for updating a ticket's status
 */
@Injectable()
export class UpdateTicketStatusUseCase {
  private readonly logger = new Logger(UpdateTicketStatusUseCase.name);

  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepository
  ) {}

  /**
   * Updates the status of a ticket
   * @param auth The authenticated user information
   * @param _id The ticket ID
   * @param status The new status
   * @returns The updated ticket
   */
  async execute(
    auth: { id: string; role: string; name?: string; email?: string; companyId?: string }, 
    _id: string, 
    status: string
  ): Promise<TicketEntity> {
    this.logger.debug(
      `Updating status of ticket ${_id} to ${status} by user ${auth.id}`,
    );
    
    // Only agents and admins can update ticket status
    if (auth.role !== 'agent' && auth.role !== 'admin') {
      throw new ForbiddenException('Only agents and admins can update ticket status', 'INSUFFICIENT_PERMISSIONS');
    }
    
    try {
      // Find the ticket
      let ticket = await this.ticketRepository.findById(_id);
      
      if (!ticket) {
        throw new NotFoundException('Ticket not found', 'TICKET_NOT_FOUND');
      }
      
      // For agents, check company access
      if (auth.role === 'agent' && auth.companyId && ticket.company.id !== auth.companyId) {
        throw new ForbiddenException('Cannot access tickets from another company', 'COMPANY_MISMATCH');
      }
      
      // Create an event for the status change
      const event = new EventEntity({
        type: 'status-change' as EventType, // Usamos el tipo correcto según EventType
        user: new UserTicketEntity({
          id: auth.id,
          name: auth.name || 'Unknown',
          email: auth.email || 'unknown@example.com',
          role: auth.role as UserRole,
        }),
        data: {
          oldStatus: ticket.status,
          newStatus: status,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      // Add event and update status
      await this.ticketRepository.addEvent(_id, event);
      ticket = await this.ticketRepository.updateStatus(
        _id,
        status as TicketStatus,
      );
      
      if (!ticket) {
        throw new NotFoundException('Ticket not found after update', 'TICKET_UPDATE_FAILED');
      }
      
      return ticket;
    } catch (error) {
      // Rethrow NotFound and Forbidden exceptions
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      
      this.logger.error(`Error updating ticket status: ${error.message}`, error.stack);
      throw error;
    }
  }
}