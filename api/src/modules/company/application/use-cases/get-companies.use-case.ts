import { Inject, Injectable, Logger } from '@nestjs/common';
import { COMPANY_REPOSITORY, CompanyRepository } from '../../domain/ports/company.repository';
import { CompanyEntity } from '../../domain/entities/company.entity';

@Injectable()
export class GetCompaniesUseCase {
  private readonly logger = new Logger(GetCompaniesUseCase.name);

  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository
  ) {}

  async execute(options?: { 
    page?: number; 
    limit?: number;
    search?: string;
  }): Promise<{ 
    companies: CompanyEntity[]; 
    total: number;
    page: number;
    limit: number;
  }> {
    this.logger.debug(`Getting companies with options: ${JSON.stringify(options)}`);

    return this.companyRepository.findAll(options);
  }
}