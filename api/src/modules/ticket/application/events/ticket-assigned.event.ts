/**
 * Event emitted when a ticket is assigned to an agent
 */
export class TicketAssignedEvent {
  constructor(
    public readonly id: string,
    public readonly data: {
      assignedBy: string;
      assignedTo: string;
      previousAgent?: string;
      companyId: string;
      departmentId: string;
    }
  ) {}
}