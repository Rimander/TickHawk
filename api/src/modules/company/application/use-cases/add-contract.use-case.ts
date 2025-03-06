import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotFoundException } from 'src/common/exceptions';
import { COMPANY_REPOSITORY, CompanyRepository } from '../../domain/ports/company.repository';
import { CompanyEntity } from '../../domain/entities/company.entity';
import { ContractEntity } from '../../domain/entities/contract.entity';

@Injectable()
export class AddContractUseCase {
  private readonly logger = new Logger(AddContractUseCase.name);

  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository
  ) {}

  async execute(companyId: string, contractData: {
    name: string;
    hours: number;
    type: 'infinite' | 'one-time' | 'recurring';
    startDate: Date;
    endDate?: Date;
    status: 'active' | 'inactive' | 'finished';
  }): Promise<CompanyEntity> {
    this.logger.debug(`Adding contract to company with ID: ${companyId}`);

    // Create contract entity
    const contract = new ContractEntity({
      name: contractData.name,
      hours: contractData.hours,
      type: contractData.type,
      startDate: contractData.startDate,
      endDate: contractData.endDate,
      status: contractData.status,
      created_at: new Date()
    });

    // Add contract to company in repository
    const company = await this.companyRepository.addContract(companyId, contract);
    
    if (!company) {
      throw new NotFoundException('Company not found', 'COMPANY_NOT_FOUND');
    }

    return company;
  }
}