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
   * Gets all tickets belonging to a customer with pagination and optional filtering
   * @param auth The authenticated user information
   * @param page The page number (1-based)
   * @param filters Optional filters for tickets (date range, limit)
   * @returns Paginated list of tickets
   */
  async execute(
    auth: { id: string; role: string; companyId?: string }, 
    page: number = 1,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<{
    tickets: TicketEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    this.logger.debug(`Getting tickets for customer ${auth.id}, page ${page}, filters: ${JSON.stringify(filters || {})}`);
    
    // Validate that the user is a customer
    if (auth.role !== 'customer') {
      throw new BadRequestException('Only customers can access customer tickets', 'INVALID_ROLE');
    }
    
    // Ensure valid page number
    if (page < 1) {
      page = 1;
    }
    
    try {
      // Prepare query options
      const queryOptions: any = {
        page: page,
        limit: filters?.limit || 10,
        customerId: auth.id
      };
      
      // Apply date filters if provided
      if (filters?.startDate) {
        queryOptions.startDate = filters.startDate;
      }
      
      if (filters?.endDate) {
        queryOptions.endDate = filters.endDate;
      }
      
      // Use repository to get tickets with pagination
      const result = await this.ticketRepository.findAll(queryOptions);
      
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