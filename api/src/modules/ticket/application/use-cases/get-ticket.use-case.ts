import { Inject, Injectable, Logger } from '@nestjs/common';
import { TICKET_REPOSITORY, TicketRepository } from '../../domain/ports/ticket.repository';
import { TicketEntity } from '../../domain/entities/ticket.entity';
import { ForbiddenException, NotFoundException } from 'src/common/exceptions';

/**
 * Use case for retrieving a specific ticket (for agents and admins)
 */
@Injectable()
export class GetTicketUseCase {
  private readonly logger = new Logger(GetTicketUseCase.name);

  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepository
  ) {}

  /**
   * Gets a specific ticket by ID for an agent or admin
   * @param auth The authenticated user information
   * @param id The ticket ID
   * @returns The ticket entity
   */
  async execute(auth: { id: string; role: string; companyId?: string }, id: string): Promise<TicketEntity> {
    this.logger.debug(`Getting ticket ${id} for user ${auth.id}, role ${auth.role}`);
    
    // Only agents and admins can access all tickets
    if (auth.role !== 'agent' && auth.role !== 'admin') {
      throw new ForbiddenException('Only agents and admins can access this ticket', 'INSUFFICIENT_PERMISSIONS');
    }
    
    try {
      let ticket: TicketEntity | null = null;
      
      // If admin, get any ticket
      if (auth.role === 'admin') {
        ticket = await this.ticketRepository.findById(id);
      } 
      // If agent, check if belongs to their company
      else if (auth.role === 'agent') {
        ticket = await this.ticketRepository.findByIdAndAgent(id, auth.id);
        
        // If not found by agent ID, check if in same company
        if (!ticket && auth.companyId) {
          ticket = await this.ticketRepository.findById(id);
          
          // If found but from different company, deny access
          if (ticket && ticket.company.id !== auth.companyId) {
            throw new ForbiddenException('Cannot access tickets from another company', 'COMPANY_MISMATCH');
          }
        }
      }
      
      if (!ticket) {
        throw new NotFoundException('Ticket not found', 'TICKET_NOT_FOUND');
      }
      
      return ticket;
    } catch (error) {
      // Rethrow NotFound and Forbidden exceptions
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      
      this.logger.error(`Error getting ticket: ${error.message}`, error.stack);
      throw error;
    }
  }
}