import { CompanyEntity } from '../entities/company.entity';
import { ContractEntity } from '../entities/contract.entity';

/**
 * Token para inyección de dependencia del repositorio de compañías
 */
export const COMPANY_REPOSITORY = 'COMPANY_REPOSITORY';

/**
 * Interface for company repository operations
 */
export interface CompanyRepository {
  /**
   * Creates a new company
   * @param company The company to create
   */
  create(company: CompanyEntity): Promise<CompanyEntity>;

  /**
   * Finds a company by ID
   * @param id The company ID
   */
  findById(id: string): Promise<CompanyEntity | null>;

  /**
   * Finds all companies with optional pagination
   * @param options Pagination options
   */
  findAll(options?: { page?: number; limit?: number; search?: string }): Promise<{ 
    companies: CompanyEntity[]; 
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * Updates a company
   * @param id The company ID
   * @param company The company data to update
   */
  update(id: string, company: Partial<CompanyEntity>): Promise<CompanyEntity | null>;

  /**
   * Deletes a company
   * @param id The company ID
   */
  delete(id: string): Promise<boolean>;

  /**
   * Adds a contract to a company
   * @param companyId The company ID
   * @param contract The contract to add
   */
  addContract(companyId: string, contract: ContractEntity): Promise<CompanyEntity | null>;

  /**
   * Removes a contract from a company
   * @param companyId The company ID
   * @param contractId The contract ID
   */
  removeContract(companyId: string, contractId: string): Promise<CompanyEntity | null>;
}