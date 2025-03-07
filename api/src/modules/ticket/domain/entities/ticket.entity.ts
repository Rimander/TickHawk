import { CommentEntity } from './comment.entity';
import { CompanyTicketEntity } from './company-ticket.entity';
import { DepartmentTicketEntity } from './department-ticket.entity';
import { EventEntity } from './event.entity';
import { FileTicketEntity } from './file-ticket.entity';
import { UserTicketEntity } from './user-ticket.entity';

export type TicketStatus = 'open' | 'closed' | 'in-progress' | 'pending' | 'resolved';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Ticket entity representing a support ticket in the platform
 */
export class TicketEntity {
  id?: string;
  _id?: string;  // Para compatibilidad
  status: TicketStatus;
  priority: TicketPriority;
  company: CompanyTicketEntity;
  customer: UserTicketEntity;
  agent?: UserTicketEntity;
  subject: string;
  content: string;
  content_user: UserTicketEntity;
  minutes: number;
  files: FileTicketEntity[];
  comments: CommentEntity[];
  events: EventEntity[];
  department: DepartmentTicketEntity;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: {
    id?: string;
    _id?: string;
    status: TicketStatus;
    priority: TicketPriority;
    company: CompanyTicketEntity;
    customer: UserTicketEntity;
    agent?: UserTicketEntity;
    subject: string;
    content: string;
    content_user: UserTicketEntity;
    minutes?: number;
    files?: FileTicketEntity[];
    comments?: CommentEntity[];
    events?: EventEntity[];
    department: DepartmentTicketEntity;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id || data._id;
    this._id = data.id || data._id;
    this.status = data.status;
    this.priority = data.priority;
    this.company = data.company;
    this.customer = data.customer;
    this.agent = data.agent;
    this.subject = data.subject;
    this.content = data.content;
    this.content_user = data.content_user;
    this.minutes = data.minutes || 0;
    this.files = data.files || [];
    this.comments = data.comments || [];
    this.events = data.events || [];
    this.department = data.department;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Adds a comment to the ticket
   * @param comment The comment to add
   */
  addComment(comment: CommentEntity): void {
    this.comments.push(comment);
    this.updateMinutes();
    this.updatedAt = new Date();
  }

  /**
   * Adds an event to the ticket
   * @param event The event to add
   */
  addEvent(event: EventEntity): void {
    this.events.push(event);
    this.updatedAt = new Date();
  }

  /**
   * Updates the ticket status
   * @param status The new status
   */
  updateStatus(status: TicketStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  /**
   * Assigns an agent to the ticket
   * @param agent The agent to assign
   */
  assignAgent(agent: UserTicketEntity): void {
    this.agent = agent;
    this.updatedAt = new Date();
  }

  /**
   * Calculates and updates the total minutes from comments
   */
  private updateMinutes(): void {
    this.minutes = this.comments.reduce((acc, comment) => {
      if (!comment.minutes) return acc;
      return acc + comment.minutes;
    }, 0);
  }

  /**
   * Closes the ticket
   */
  close(): void {
    this.status = 'closed';
    this.updatedAt = new Date();
  }

  /**
   * Reopens the ticket if it was closed
   */
  reopen(): void {
    if (this.status === 'closed') {
      this.status = 'open';
      this.updatedAt = new Date();
    }
  }
}