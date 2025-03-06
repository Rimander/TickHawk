import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CompanyCreatedEvent } from './company-created.event';
import { CompanyUpdatedEvent } from './company-updated.event';
import { CompanyDeletedEvent } from './company-deleted.event';

@Injectable()
export class CompanyEventListener {
  private readonly logger = new Logger(CompanyEventListener.name);

  @OnEvent('company.created')
  handleCompanyCreatedEvent(event: CompanyCreatedEvent): void {
    this.logger.debug(`[Event] Company created: ${JSON.stringify({
      id: event.companyId,
      name: event.companyData.name,
      email: event.companyData.email
    })}`);
    
    // This listener can be extended to perform actions when a company is created
    // For example, creating default departments, notifying admins, etc.
  }

  @OnEvent('company.updated')
  handleCompanyUpdatedEvent(event: CompanyUpdatedEvent): void {
    this.logger.debug(`[Event] Company updated: ${JSON.stringify({
      id: event.companyId,
      updates: event.updates
    })}`);
    
    // This listener can be extended to perform actions when a company is updated
    // For example, updating related records in other domains, sending notifications, etc.
  }

  @OnEvent('company.deleted')
  handleCompanyDeletedEvent(event: CompanyDeletedEvent): void {
    this.logger.debug(`[Event] Company deleted: ${JSON.stringify({
      id: event.companyId,
      name: event.companyData.name,
      email: event.companyData.email
    })}`);
    
    // This listener can be extended to perform cleanup actions when a company is deleted
    // For example, deleting related records, notifying users, archiving data, etc.
  }
}