import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from 'src/common/exceptions';
import { COMPANY_REPOSITORY, CompanyRepository } from '../../domain/ports/company.repository';
import { CompanyDeletedEvent } from '../events/company-deleted.event';

@Injectable()
export class DeleteCompanyUseCase {
  private readonly logger = new Logger(DeleteCompanyUseCase.name);

  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(id: string): Promise<boolean> {
    this.logger.debug(`Deleting company with ID: ${id}`);

    // Find company first to emit event with its data
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new NotFoundException('Company not found', 'COMPANY_NOT_FOUND');
    }

    // Delete company from repository
    const isDeleted = await this.companyRepository.delete(id);

    if (isDeleted) {
      // Emit deletion event
      this.eventEmitter.emit(
        'company.deleted',
        new CompanyDeletedEvent(
          id,
          { name: company.name, email: company.email }
        )
      );
    }

    return isDeleted;
  }
}