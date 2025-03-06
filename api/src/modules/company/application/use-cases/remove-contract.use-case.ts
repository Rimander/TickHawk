import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotFoundException } from 'src/common/exceptions';
import { COMPANY_REPOSITORY, CompanyRepository } from '../../domain/ports/company.repository';
import { CompanyEntity } from '../../domain/entities/company.entity';

@Injectable()
export class RemoveContractUseCase {
  private readonly logger = new Logger(RemoveContractUseCase.name);

  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository
  ) {}

  async execute(companyId: string, contractId: string): Promise<CompanyEntity> {
    this.logger.debug(`Removing contract ${contractId} from company ${companyId}`);

    // Remove contract from company in repository
    const company = await this.companyRepository.removeContract(companyId, contractId);
    
    if (!company) {
      throw new NotFoundException('Company not found', 'COMPANY_NOT_FOUND');
    }

    return company;
  }
}