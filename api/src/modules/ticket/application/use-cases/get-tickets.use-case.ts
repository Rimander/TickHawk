import { Inject, Injectable, Logger } from '@nestjs/common';
import { TICKET_REPOSITORY, TicketRepository } from '../../domain/ports/ticket.repository';
import { TicketEntity } from '../../domain/entities/ticket.entity';
import { ForbiddenException } from 'src/common/exceptions';

/**
 * Use case for retrieving all tickets (for agents and admins)
 */
@Injectable()
export class GetTicketsUseCase {
  private readonly logger = new Logger(GetTicketsUseCase.name);

  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepository
  ) {}

  /**
   * Gets all tickets with pagination and optional filtering
   * @param auth The authenticated user information
   * @param page The page number (1-based)
   * @param filters Optional filters for tickets
   * @returns Paginated list of tickets
   */
  async execute(
    auth: { id: string; role: string; companyId?: string }, 
    page: number = 1,
    filters?: {
      companyId?: string;
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
    this.logger.debug(`Getting tickets, page ${page}, user ${auth.id}, role ${auth.role}, filters: ${JSON.stringify(filters || {})}`);
    
    // Only agents and admins can access all tickets
    if (auth.role !== 'agent' && auth.role !== 'admin') {
      throw new ForbiddenException('Only agents and admins can access all tickets', 'INSUFFICIENT_PERMISSIONS');
    }
    
    // Ensure valid page number
    if (page < 1) {
      page = 1;
    }
    
    try {
      // Prepare query options
      const queryOptions: any = {
        page: page,
        limit: filters?.limit || 10
      };
      
      // Apply date filters if provided
      if (filters?.startDate) {
        queryOptions.startDate = filters.startDate;
      }
      
      if (filters?.endDate) {
        queryOptions.endDate = filters.endDate;
      }
      
      // Apply company filter if provided or user is an agent
      if (filters?.companyId) {
        queryOptions.companyId = filters.companyId;
        
        // Check if admin is trying to access another company's tickets
        if (auth.role === 'agent' && auth.companyId && auth.companyId !== filters.companyId) {
          throw new ForbiddenException('Cannot access tickets from another company', 'COMPANY_MISMATCH');
        }
      } else if (auth.role === 'agent' && auth.companyId) {
        // If no company filter but user is an agent, restrict to their company
        queryOptions.companyId = auth.companyId;
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
      this.logger.error(`Error getting tickets: ${error.message}`, error.stack);
      throw error;
    }
  }
}