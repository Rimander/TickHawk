/**
 * Event emitted when a company is deleted
 */
export class CompanyDeletedEvent {
  constructor(
    public readonly companyId: string,
    public readonly companyData: {
      name: string;
      email: string;
    }
  ) {}
}