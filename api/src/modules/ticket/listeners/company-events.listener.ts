import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket } from '../infrastructure/schemas/ticket.schema';

/**
 * Listener for company events
 * Updates company information in tickets when a company is updated or deleted
 */
@Injectable()
export class CompanyEventsListener {
  private readonly logger = new Logger(CompanyEventsListener.name);

  constructor(
    @InjectModel(Ticket.name) private readonly ticketModel: Model<Ticket>
  ) {}

  /**
   * Updates company information in tickets when a company is updated
   */
  @OnEvent('company.updated')
  async handleCompanyUpdatedEvent(payload: { id: string; name?: string; email?: string }) {
    try {
      this.logger.log(`Company updated event received for company: ${payload.id}`);

      if (!payload.name && !payload.email) {
        this.logger.debug('No company information to update in tickets');
        return;
      }

      const companyId = new Types.ObjectId(payload.id);
      const updateData: any = {};
      
      if (payload.name) {
        updateData['company.name'] = payload.name;
      }
      
      if (payload.email) {
        updateData['company.email'] = payload.email;
      }

      // Update tickets with this company
      const result = await this.ticketModel.updateMany(
        { 'company._id': companyId },
        { $set: updateData }
      );

      this.logger.log(`Updated company information in ${result.modifiedCount} tickets`);
    } catch (error) {
      this.logger.error(`Error updating company information in tickets: ${error.message}`, error.stack);
    }
  }

  /**
   * Marks tickets as archived when a company is deleted
   */
  @OnEvent('company.deleted')
  async handleCompanyDeletedEvent(payload: { id: string }) {
    try {
      this.logger.log(`Company deleted event received for company: ${payload.id}`);

      const companyId = new Types.ObjectId(payload.id);

      // Archive tickets for this company by marking them as closed
      const result = await this.ticketModel.updateMany(
        { 'company._id': companyId, status: { $ne: 'closed' } },
        { $set: { status: 'closed', updatedAt: new Date() } }
      );

      this.logger.log(`Closed ${result.modifiedCount} tickets for deleted company ${payload.id}`);
    } catch (error) {
      this.logger.error(`Error handling deleted company in tickets: ${error.message}`, error.stack);
    }
  }
}