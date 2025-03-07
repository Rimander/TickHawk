import { Inject, Injectable, Logger } from '@nestjs/common';
import { TICKET_REPOSITORY, TicketRepository } from '../../domain/ports/ticket.repository';
import { TicketEntity } from '../../domain/entities/ticket.entity';
import { BadRequestException, NotFoundException } from 'src/common/exceptions';

/**
 * Use case for retrieving a specific customer ticket
 */
@Injectable()
export class GetCustomerTicketUseCase {
  private readonly logger = new Logger(GetCustomerTicketUseCase.name);

  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepository
  ) {}

  /**
   * Gets a specific ticket belonging to a customer
   * @param auth The authenticated user information
   * @param id The ticket ID
   * @returns The ticket if found and belongs to the customer
   */
  async execute(auth: { id: string; role: string; companyId?: string }, id: string): Promise<TicketEntity> {
    this.logger.debug(`Getting ticket ${id} for customer ${auth.id}`);
    
    // Validate that the user is a customer
    if (auth.role !== 'customer') {
      throw new BadRequestException('Only customers can access customer tickets', 'INVALID_ROLE');
    }
    
    try {
      // Use repository to get the ticket
      const ticket = await this.ticketRepository.findByIdAndCustomer(id, auth.id);
      
      if (!ticket) {
        throw new NotFoundException('Ticket not found or does not belong to this customer', 'TICKET_NOT_FOUND');
      }
      
      return ticket;
    } catch (error) {
      this.logger.error(`Error getting customer ticket: ${error.message}`, error.stack);
      throw error;
    }
  }
}