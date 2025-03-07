import { TicketEntity, TicketStatus } from '../entities/ticket.entity';
import { CommentEntity } from '../entities/comment.entity';
import { UserTicketEntity } from '../entities/user-ticket.entity';
import { EventEntity } from '../entities/event.entity';

/**
 * Token para inyección de dependencia del repositorio de tickets
 */
export const TICKET_REPOSITORY = 'TICKET_REPOSITORY';

/**
 * Interface for ticket repository operations
 */
export interface TicketRepository {
  /**
   * Creates a new ticket
   * @param ticket The ticket to create
   */
  create(ticket: TicketEntity): Promise<TicketEntity>;

  /**
   * Finds a ticket by ID
   * @param id The ticket ID
   */
  findById(id: string): Promise<TicketEntity | null>;

  /**
   * Finds a ticket by ID and customer ID (for customer access)
   * @param id The ticket ID
   * @param customerId The customer ID
   */
  findByIdAndCustomer(id: string, customerId: string): Promise<TicketEntity | null>;

  /**
   * Finds a ticket by ID and agent ID (for agent access)
   * @param id The ticket ID
   * @param agentId The agent ID
   */
  findByIdAndAgent(id: string, agentId: string): Promise<TicketEntity | null>;

  /**
   * Finds all tickets with pagination and optional filters
   * @param options Pagination and filter options
   */
  findAll(options: {
    page?: number;
    limit?: number;
    agentId?: string;
    customerId?: string;
    companyId?: string;
    departmentId?: string;
    status?: TicketStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    tickets: TicketEntity[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * Updates a ticket
   * @param id The ticket ID
   * @param ticket The ticket data to update
   */
  update(id: string, ticket: Partial<TicketEntity>): Promise<TicketEntity | null>;

  /**
   * Updates a ticket's status
   * @param id The ticket ID
   * @param status The new status
   */
  updateStatus(id: string, status: TicketStatus): Promise<TicketEntity | null>;

  /**
   * Assigns an agent to a ticket
   * @param id The ticket ID
   * @param agent The agent to assign
   */
  assignAgent(id: string, agent: UserTicketEntity): Promise<TicketEntity | null>;

  /**
   * Adds a comment to a ticket
   * @param id The ticket ID
   * @param comment The comment to add
   */
  addComment(id: string, comment: CommentEntity): Promise<TicketEntity | null>;

  /**
   * Adds an event to a ticket
   * @param id The ticket ID
   * @param event The event to add
   */
  addEvent(id: string, event: EventEntity): Promise<TicketEntity | null>;

  /**
   * Counts tickets by status for a company
   * @param companyId The company ID
   */
  countByStatusForCompany(companyId: string): Promise<Record<TicketStatus, number>>;
  
  /**
   * Gets tickets belonging to a specific file
   * @param fileId The file ID
   */
  findByFileId(fileId: string): Promise<TicketEntity[]>;
}