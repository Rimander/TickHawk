import { CompanyTicketEntity } from '../entities/company-ticket.entity';

/**
 * Token para inyección de dependencia del proveedor de compañías
 */
export const COMPANY_PROVIDER = 'COMPANY_PROVIDER';

/**
 * Interface for company provider operations
 */
export interface CompanyProvider {
  /**
   * Gets company information by ID
   * @param id The company ID
   */
  getById(id: string): Promise<{ id: string; name: string; email: string } | null>;
  
  /**
   * Checks if a company exists
   * @param id The company ID
   */
  exists(id: string): Promise<boolean>;
  
  /**
   * Maps a company to a CompanyTicketEntity
   * @param company The company data
   */
  mapToCompanyTicket(company: any): CompanyTicketEntity;
}