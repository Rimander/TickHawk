import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket } from '../infrastructure/schemas/ticket.schema';

/**
 * Listener for user updated events
 * Updates user information in tickets when a user is updated
 */
@Injectable()
export class UserUpdatedListener {
  private readonly logger = new Logger(UserUpdatedListener.name);

  constructor(
    @InjectModel(Ticket.name) private readonly ticketModel: Model<Ticket>
  ) {}

  /**
   * Updates user information in tickets when a user is updated
   */
  @OnEvent('user.updated')
  async handleUserUpdatedEvent(payload: { id: string; name?: string; email?: string }) {
    try {
      this.logger.log(`User updated event received for user: ${payload.id}`);

      if (!payload.name && !payload.email) {
        this.logger.debug('No user information to update in tickets');
        return;
      }

      const userId = new Types.ObjectId(payload.id);
      const updateData: any = {};
      
      if (payload.name) {
        updateData['customer.name'] = payload.name;
        updateData['agent.name'] = payload.name;
        updateData['content_user.name'] = payload.name;
        updateData['comments.$[comment].user.name'] = payload.name;
        updateData['events.$[event].user.name'] = payload.name;
      }
      
      if (payload.email) {
        updateData['customer.email'] = payload.email;
        updateData['agent.email'] = payload.email;
        updateData['content_user.email'] = payload.email;
        updateData['comments.$[comment].user.email'] = payload.email;
        updateData['events.$[event].user.email'] = payload.email;
      }

      // Update tickets with this user as customer, agent, or content creator
      const result = await this.ticketModel.updateMany(
        {
          $or: [
            { 'customer._id': userId },
            { 'agent._id': userId },
            { 'content_user._id': userId },
            { 'comments.user._id': userId },
            { 'events.user._id': userId }
          ]
        },
        { $set: updateData },
        {
          arrayFilters: [
            { 'comment.user._id': userId },
            { 'event.user._id': userId }
          ]
        }
      );

      this.logger.log(`Updated user information in ${result.modifiedCount} tickets`);
    } catch (error) {
      this.logger.error(`Error updating user information in tickets: ${error.message}`, error.stack);
    }
  }
}