/**
 * Event emitted when a ticket is closed
 */
export class TicketClosedEvent {
  constructor(
    public readonly id: string,
    public readonly data: {
      closedBy: string;
      closedByRole: string;
      companyId: string;
      customerId: string;
      agentId?: string;
    }
  ) {}
}