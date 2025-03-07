import { FileTicketEntity } from './file-ticket.entity';
import { UserTicketEntity } from './user-ticket.entity';

/**
 * Comment entity representing a comment on a ticket
 */
export class CommentEntity {
  id?: string;
  _id?: string;  // Para compatibilidad
  user: UserTicketEntity;
  content: string;
  minutes?: number;
  files: FileTicketEntity[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: {
    id?: string;
    _id?: string;
    user: UserTicketEntity;
    content: string;
    minutes?: number;
    files?: FileTicketEntity[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id || data._id;
    this._id = data.id || data._id;
    this.user = data.user;
    this.content = data.content;
    this.minutes = data.minutes || 0;
    this.files = data.files || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}