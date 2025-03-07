import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TICKET_REPOSITORY, TicketRepository } from '../../domain/ports/ticket.repository';
import { EventEntity } from '../../domain/entities/event.entity';
import { USER_PROVIDER, UserProvider } from '../../domain/ports/user.provider';
import { BadRequestException, NotFoundException } from 'src/common/exceptions';
import { TicketClosedEvent } from '../events/ticket-closed.event';

/**
 * Use case for closing a customer ticket
 */
@Injectable()
export class CloseCustomerTicketUseCase {
  private readonly logger = new Logger(CloseCustomerTicketUseCase.name);

  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepository,
    @Inject(USER_PROVIDER)
    private readonly userProvider: UserProvider,
    private readonly eventEmitter: EventEmitter2
  ) {}

  /**
   * Closes a customer ticket
   * @param auth The authenticated user information
   * @param id The ticket ID to close
   * @returns The updated ticket
   */
  async execute(auth: { id: string; role: string; companyId?: string }, id: string) {
    this.logger.debug(`Customer ${auth.id} closing ticket ${id}`);
    
    // Validate that the user is a customer
    if (auth.role !== 'customer') {
      throw new BadRequestException('Only customers can close their own tickets', 'INVALID_ROLE');
    }
    
    try {
      // Find the ticket
      const ticket = await this.ticketRepository.findByIdAndCustomer(id, auth.id);
      
      if (!ticket) {
        throw new NotFoundException('Ticket not found or does not belong to this customer', 'TICKET_NOT_FOUND');
      }
      
      // Check if already closed
      if (ticket.status === 'closed') {
        throw new BadRequestException('Ticket is already closed', 'TICKET_ALREADY_CLOSED');
      }
      
      // Get user information
      const user = await this.userProvider.findById(auth.id);
      
      if (!user) {
        throw new NotFoundException('User not found', 'USER_NOT_FOUND');
      }
      
      // Create closure event
      const userTicket = this.userProvider.mapToUserTicket(user);
      const event = new EventEntity({
        user: userTicket,
        type: 'close',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Add event and update status
      await this.ticketRepository.addEvent(ticket.id, event);
      const updatedTicket = await this.ticketRepository.updateStatus(ticket.id, 'closed');
      
      // Emit event
      this.eventEmitter.emit(
        'ticket.closed',
        new TicketClosedEvent(
          updatedTicket.id,
          {
            closedBy: auth.id,
            closedByRole: auth.role,
            companyId: updatedTicket.company.id,
            customerId: updatedTicket.customer.id,
            agentId: updatedTicket.agent?.id
          }
        )
      );
      
      return updatedTicket;
    } catch (error) {
      this.logger.error(`Error closing ticket: ${error.message}`, error.stack);
      throw error;
    }
  }
}