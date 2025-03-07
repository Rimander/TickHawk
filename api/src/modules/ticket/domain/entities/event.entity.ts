import { UserTicketEntity } from './user-ticket.entity';

export type EventType = 'close' | 'open' | 're-open' | 'transfer' | 'status-change' | 'assign-agent' | 'create' | 'comment' | 'agent-comment';

/**
 * Event entity representing an event in a ticket
 */
export class EventEntity {
  id?: string;
  _id?: string;  // Para compatibilidad
  user: UserTicketEntity;
  type: EventType;
  data?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: {
    id?: string;
    _id?: string;
    user: UserTicketEntity;
    type: EventType;
    data?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id || data._id;
    this._id = data.id || data._id;
    this.user = data.user;
    this.type = data.type;
    this.data = data.data;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}