import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TicketCreatedEvent } from './ticket-created.event';
import { TicketClosedEvent } from './ticket-closed.event';
import { TicketUpdatedEvent } from './ticket-updated.event';
import { TicketRepliedEvent } from './ticket-replied.event';
import { TicketAssignedEvent } from './ticket-assigned.event';

@Injectable()
export class TicketEventListener {
  private readonly logger = new Logger(TicketEventListener.name);

  @OnEvent('ticket.created')
  handleTicketCreatedEvent(event: TicketCreatedEvent) {
    this.logger.log(`Ticket created: ${event.id} - ${event.data.subject}`);
    // Additional logic for ticket creation event
  }

  @OnEvent('ticket.updated')
  handleTicketUpdatedEvent(event: TicketUpdatedEvent) {
    this.logger.log(`Ticket updated: ${event.id} by ${event.data.updatedByRole} ${event.data.updatedBy}`);
    // Additional logic for ticket update event
  }

  @OnEvent('ticket.closed')
  handleTicketClosedEvent(event: TicketClosedEvent) {
    this.logger.log(`Ticket closed: ${event.id} by ${event.data.closedByRole} ${event.data.closedBy}`);
    // Additional logic for ticket closure event
  }

  @OnEvent('ticket.replied')
  handleTicketRepliedEvent(event: TicketRepliedEvent) {
    this.logger.log(`Ticket replied: ${event.id} by ${event.data.repliedByRole} ${event.data.repliedBy}`);
    // Additional logic for ticket reply event
  }

  @OnEvent('ticket.assigned')
  handleTicketAssignedEvent(event: TicketAssignedEvent) {
    this.logger.log(`Ticket assigned: ${event.id} to ${event.data.assignedTo} by ${event.data.assignedBy}`);
    // Additional logic for ticket assignment event
  }
}