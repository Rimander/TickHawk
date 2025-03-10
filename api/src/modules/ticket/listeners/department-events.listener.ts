import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket } from '../infrastructure/schemas/ticket.schema';

/**
 * Listener for department events
 * Updates department information in tickets when a department is updated or deleted
 */
@Injectable()
export class DepartmentEventsListener {
  private readonly logger = new Logger(DepartmentEventsListener.name);

  constructor(
    @InjectModel(Ticket.name) private readonly ticketModel: Model<Ticket>
  ) {}

  /**
   * Updates department information in tickets when a department is updated
   */
  @OnEvent('department.updated')
  async handleDepartmentUpdatedEvent(payload: { departmentId: string; updates: { name?: string } }) {
    try {
      this.logger.log(`Department updated event received for department: ${payload.departmentId}`);

      if (!payload.updates.name) {
        this.logger.debug('No department name to update in tickets');
        return;
      }

      const departmentId = new Types.ObjectId(payload.departmentId);
      const updateData = {
        'department.name': payload.updates.name
      };

      // Update tickets with this department
      const result = await this.ticketModel.updateMany(
        { 'department._id': departmentId },
        { $set: updateData }
      );

      this.logger.log(`Updated department information in ${result.modifiedCount} tickets`);
    } catch (error) {
      this.logger.error(`Error updating department information in tickets: ${error.message}`, error.stack);
    }
  }

  /**
   * Handles tickets when a department is deleted
   */
  @OnEvent('department.deleted')
  async handleDepartmentDeletedEvent(payload: { departmentId: string }) {
    try {
      this.logger.log(`Department deleted event received for department: ${payload.departmentId}`);

      const departmentId = new Types.ObjectId(payload.departmentId);

      // Mark tickets as closed for deleted department
      const result = await this.ticketModel.updateMany(
        { 'department._id': departmentId, status: { $ne: 'closed' } },
        { $set: { status: 'closed', updatedAt: new Date() } }
      );

      this.logger.log(`Closed ${result.modifiedCount} tickets for deleted department ${payload.departmentId}`);
    } catch (error) {
      this.logger.error(`Error handling deleted department in tickets: ${error.message}`, error.stack);
    }
  }
}