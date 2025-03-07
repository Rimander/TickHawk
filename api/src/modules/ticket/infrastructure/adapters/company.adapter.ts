import { Injectable } from '@nestjs/common';
import { GetCompanyUseCase } from '../../../company/application/use-cases/get-company.use-case';
import { CompanyProvider } from '../../domain/ports/company.provider';
import { CompanyTicketEntity } from '../../domain/entities/company-ticket.entity';

/**
 * Adapter for company use cases
 */
@Injectable()
export class CompanyAdapter implements CompanyProvider {
  constructor(
    private readonly getCompanyUseCase: GetCompanyUseCase
  ) {}

  /**
   * Gets company information by ID
   * @param id The company ID
   */
  async getById(id: string): Promise<{ id: string; name: string; email: string } | null> {
    try {
      const company = await this.getCompanyUseCase.execute(id);
      if (!company) return null;
      
      return {
        id: company.id,
        name: company.name,
        email: company.email
      };
    } catch (error) {
      // If not found, return null
      if (error.name === 'NotFoundException') {
        return null;
      }
      throw error;
    }
  }
  
  /**
   * Checks if a company exists
   * @param id The company ID
   */
  async exists(id: string): Promise<boolean> {
    try {
      const company = await this.getCompanyUseCase.execute(id);
      return !!company;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Maps a company to a CompanyTicketEntity
   * @param company The company data
   */
  mapToCompanyTicket(company: any): CompanyTicketEntity {
    return new CompanyTicketEntity({
      id: company.id,
      name: company.name,
      email: company.email
    });
  }
}