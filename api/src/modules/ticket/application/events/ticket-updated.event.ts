import { TicketPriority, TicketStatus } from '../../domain/entities/ticket.entity';

/**
 * Event emitted when a ticket is updated
 */
export class TicketUpdatedEvent {
  constructor(
    public readonly id: string,
    public readonly data: {
      status?: TicketStatus;
      priority?: TicketPriority;
      agentId?: string;
      updatedBy: string;
      updatedByRole: string;
    }
  ) {}
}