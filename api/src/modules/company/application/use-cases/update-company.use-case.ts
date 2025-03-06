import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from 'src/common/exceptions';
import { COMPANY_REPOSITORY, CompanyRepository } from '../../domain/ports/company.repository';
import { CompanyEntity } from '../../domain/entities/company.entity';
import { CompanyUpdatedEvent } from '../events/company-updated.event';

@Injectable()
export class UpdateCompanyUseCase {
  private readonly logger = new Logger(UpdateCompanyUseCase.name);

  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(
    id: string, 
    updateData: { name?: string; email?: string }
  ): Promise<CompanyEntity> {
    this.logger.debug(`Updating company with ID: ${id}`);

    // Find company
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new NotFoundException('Company not found', 'COMPANY_NOT_FOUND');
    }

    // Track changes to emit in event
    const changes = {};
    if (updateData.name && updateData.name !== company.name) {
      changes['name'] = updateData.name;
    }
    if (updateData.email && updateData.email !== company.email) {
      changes['email'] = updateData.email;
    }

    // Update company in repository
    const updatedCompany = await this.companyRepository.update(id, updateData);

    // Emit update event if there were changes
    if (Object.keys(changes).length > 0) {
      this.eventEmitter.emit(
        'company.updated',
        new CompanyUpdatedEvent(id, changes)
      );
    }

    return updatedCompany;
  }
}