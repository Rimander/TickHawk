import { Inject, Injectable, Logger } from '@nestjs/common';
import { TICKET_REPOSITORY, TicketRepository } from '../../domain/ports/ticket.repository';
import { TicketEntity } from '../../domain/entities/ticket.entity';
import { BadRequestException } from 'src/common/exceptions';

/**
 * Use case for retrieving customer tickets
 */
@Injectable()
export class GetCustomerTicketsUseCase {
  private readonly logger = new Logger(GetCustomerTicketsUseCase.name);

  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepository
  ) {}

  /**
   * Gets all tickets belonging to a customer with pagination
   * @param auth The authenticated user information
   * @param page The page number (1-based)
   * @returns Paginated list of tickets
   */
  async execute(auth: { id: string; role: string; companyId?: string }, page: number = 1): Promise<{
    tickets: TicketEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    this.logger.debug(`Getting tickets for customer ${auth.id}, page ${page}`);
    
    // Validate that the user is a customer
    if (auth.role !== 'customer') {
      throw new BadRequestException('Only customers can access customer tickets', 'INVALID_ROLE');
    }
    
    // Ensure valid page number
    if (page < 1) {
      page = 1;
    }
    
    try {
      // Use repository to get tickets with pagination
      const result = await this.ticketRepository.findAll({
        page: page,
        limit: 10, // Fixed limit for customer tickets
        customerId: auth.id
      });
      
      return {
        tickets: result.tickets,
        total: result.total,
        page: result.page,
        limit: result.limit
      };
    } catch (error) {
      this.logger.error(`Error getting customer tickets: ${error.message}`, error.stack);
      throw error;
    }
  }
}