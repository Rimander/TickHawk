import { TicketPriority, TicketStatus } from '../../domain/entities/ticket.entity';

/**
 * Event emitted when a new ticket is created
 */
export class TicketCreatedEvent {
  constructor(
    public readonly id: string,
    public readonly data: {
      status: TicketStatus;
      priority: TicketPriority;
      subject: string;
      companyId: string;
      customerId: string;
      agentId?: string;
      departmentId: string;
    }
  ) {}
}