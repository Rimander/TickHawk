/**
 * Event emitted when a company is updated
 */
export class CompanyUpdatedEvent {
  constructor(
    public readonly companyId: string,
    public readonly updates: {
      name?: string;
      email?: string;
    }
  ) {}
}