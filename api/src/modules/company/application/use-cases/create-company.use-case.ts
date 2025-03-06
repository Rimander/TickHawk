import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { COMPANY_REPOSITORY, CompanyRepository } from '../../domain/ports/company.repository';
import { CompanyEntity } from '../../domain/entities/company.entity';
import { CompanyCreatedEvent } from '../events/company-created.event';
import { ConflictException } from 'src/common/exceptions';

@Injectable()
export class CreateCompanyUseCase {
  private readonly logger = new Logger(CreateCompanyUseCase.name);

  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(companyData: { name: string; email: string }): Promise<CompanyEntity> {
    this.logger.debug(`Creating company with name: ${companyData.name}`);

    // Create company entity
    const company = new CompanyEntity({
      name: companyData.name,
      email: companyData.email,
      contracts: []
    });

    try {
      // Save company in repository
      const createdCompany = await this.companyRepository.create(company);

      // Emit created event
      this.eventEmitter.emit(
        'company.created',
        new CompanyCreatedEvent(
          createdCompany.id,
          { name: createdCompany.name, email: createdCompany.email }
        )
      );

      return createdCompany;
    } catch (error) {
      this.logger.error(`Error creating company: ${error.message}`, error.stack);
      
      // Handle database unique constraints
      if (error.code === 11000) {  // MongoDB duplicate key error
        throw new ConflictException('Company with this name already exists', 'COMPANY_NAME_EXISTS');
      }
      
      throw error;
    }
  }
}