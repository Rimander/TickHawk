/**
 * Event emitted when a new company is created
 */
export class CompanyCreatedEvent {
  constructor(
    public readonly companyId: string,
    public readonly companyData: {
      name: string;
      email: string;
    }
  ) {}
}