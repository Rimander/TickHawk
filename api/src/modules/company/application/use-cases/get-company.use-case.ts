import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotFoundException } from 'src/common/exceptions';
import { COMPANY_REPOSITORY, CompanyRepository } from '../../domain/ports/company.repository';
import { CompanyEntity } from '../../domain/entities/company.entity';

@Injectable()
export class GetCompanyUseCase {
  private readonly logger = new Logger(GetCompanyUseCase.name);

  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository
  ) {}

  async execute(id: string): Promise<CompanyEntity> {
    this.logger.debug(`Getting company with ID: ${id}`);

    const company = await this.companyRepository.findById(id);
    
    if (!company) {
      throw new NotFoundException('Company not found', 'COMPANY_NOT_FOUND');
    }

    return company;
  }
}