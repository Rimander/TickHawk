/**
 * Event emitted when a ticket is replied to
 */
export class TicketRepliedEvent {
  constructor(
    public readonly id: string,
    public readonly data: {
      repliedBy: string;
      repliedByRole: string;
      companyId: string;
      customerId: string;
      agentId?: string;
      commentId: string;
      hasFiles: boolean;
    }
  ) {}
}