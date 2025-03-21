import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TicketRepository } from '../../domain/ports/ticket.repository';
import { TicketEntity, TicketStatus } from '../../domain/entities/ticket.entity';
import { CommentEntity } from '../../domain/entities/comment.entity';
import { UserTicketEntity } from '../../domain/entities/user-ticket.entity';
import { EventEntity } from '../../domain/entities/event.entity';
import { CompanyTicketEntity } from '../../domain/entities/company-ticket.entity';
import { FileTicketEntity } from '../../domain/entities/file-ticket.entity';
import { DepartmentTicketEntity } from '../../domain/entities/department-ticket.entity';
import { Ticket } from '../schemas/ticket.schema';
import { Comment } from '../schemas/comment.schema';
import { UserTicket } from '../schemas/user-ticket.schema';
import { Event } from '../schemas/event.schema';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MongoTicketRepository implements TicketRepository {
  private readonly logger = new Logger(MongoTicketRepository.name);

  constructor(
    @InjectModel(Ticket.name) private readonly ticketModel: Model<Ticket>,
  ) {}

  /**
   * Maps a Mongoose ticket document to a TicketEntity
   */
  private mapToEntity(ticket: any): TicketEntity {
    // Convert Mongoose document to plain object
    const plainTicket = ticket.toJSON ? ticket.toJSON() : ticket;
    
    // Validación para prevenir errores con documentos nulos o incompletos
    if (!plainTicket || !plainTicket._id) {
      this.logger.error(`Invalid ticket document: ${JSON.stringify(plainTicket)}`);
      throw new Error('Invalid ticket document structure');
    }
    
    return new TicketEntity({
      id: plainTicket._id.toString(),
      status: plainTicket.status as TicketStatus,
      priority: plainTicket.priority as any,
      company: plainTicket.company ? new CompanyTicketEntity({
        id: plainTicket.company._id?.toString(),
        name: plainTicket.company.name,
        email: plainTicket.company.email,
      }) : null,
      customer: plainTicket.customer ? new UserTicketEntity({
        id: plainTicket.customer._id?.toString(),
        name: plainTicket.customer.name,
        email: plainTicket.customer.email,
        role: plainTicket.customer.role,
      }) : null,
      agent: plainTicket.agent ? new UserTicketEntity({
        id: plainTicket.agent._id?.toString(),
        name: plainTicket.agent.name,
        email: plainTicket.agent.email,
        role: plainTicket.agent.role,
      }) : undefined,
      subject: plainTicket.subject,
      content: plainTicket.content,
      content_user: plainTicket.content_user ? new UserTicketEntity({
        id: plainTicket.content_user._id?.toString(),
        name: plainTicket.content_user.name,
        email: plainTicket.content_user.email,
        role: plainTicket.content_user.role,
      }) : null,
      minutes: plainTicket.minutes,
      files: (plainTicket.files || []).map(file => {
        if (!file) return null;
        return new FileTicketEntity({
          id: file._id?.toString(),
          name: file.name,
          mimetype: file.mimetype,
        });
      }).filter(Boolean),
      comments: (plainTicket.comments || []).map(comment => {
        if (!comment) return null;
        return new CommentEntity({
          id: comment._id?.toString(),
          user: comment.user
            ? new UserTicketEntity({
                id: comment.user._id?.toString(),
                name: comment.user.name,
                email: comment.user.email,
                role: comment.user.role,
              })
            : null,
          content: comment.content,
          // Migración horas a minutos - se mantiene para compatibilidad
          minutes: comment.minutes || (comment.hours ? comment.hours * 60 : 0), // Asegurarnos de que siempre hay un valor
          files: (comment.files || [])
            .map((file) => {
              if (!file) return null;
              return new FileTicketEntity({
                id: file._id?.toString(),
                name: file.name,
                mimetype: file.mimetype,
              });
            })
            .filter(Boolean),
          internal: comment.internal || false,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
        });
      }).filter(Boolean),
      events: (plainTicket.events || []).map(event => {
        if (!event) return null;
        return new EventEntity({
          id: event._id?.toString(),
          type: event.type as any,
          user: event.user ? new UserTicketEntity({
            id: event.user._id?.toString(),
            name: event.user.name,
            email: event.user.email,
            role: event.user.role,
          }) : null,
          data: event.data,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        });
      }).filter(Boolean),
      department: plainTicket.department ? new DepartmentTicketEntity({
        id: plainTicket.department._id?.toString(),
        name: plainTicket.department.name,
      }) : null,
      createdAt: plainTicket.createdAt,
      updatedAt: plainTicket.updatedAt,
    });
  }

  async create(ticket: TicketEntity): Promise<TicketEntity> {
    this.logger.debug(`Creating ticket: ${ticket.subject}`);
    
    const newTicket = new this.ticketModel({
      status: ticket.status,
      priority: ticket.priority,
      company: {
        _id: new Types.ObjectId(ticket.company.id),
        name: ticket.company.name,
        email: ticket.company.email,
      },
      customer: {
        _id: new Types.ObjectId(ticket.customer.id),
        name: ticket.customer.name,
        email: ticket.customer.email,
        role: ticket.customer.role,
      },
      agent: ticket.agent
        ? {
            _id: new Types.ObjectId(ticket.agent.id),
            name: ticket.agent.name,
            email: ticket.agent.email,
            role: ticket.agent.role,
          }
        : undefined,
      subject: ticket.subject,
      content: ticket.content,
      content_user: {
        _id: new Types.ObjectId(ticket.content_user.id),
        name: ticket.content_user.name,
        email: ticket.content_user.email,
        role: ticket.content_user.role,
      },
      minutes: ticket.minutes,
      files:
        ticket.files?.map((file) => ({
          _id: new Types.ObjectId(file.id),
          name: file.name,
          mimetype: file.mimetype,
        })) || [],
      comments:
        ticket.comments?.map((comment) => ({
          user: {
            _id: new Types.ObjectId(comment.user.id),
            name: comment.user.name,
            email: comment.user.email,
            role: comment.user.role,
          },
          content: comment.content,
          minutes: comment.minutes,
          files:
            comment.files?.map((file) => ({
              _id: new Types.ObjectId(file.id),
              name: file.name,
              mimetype: file.mimetype,
            })) || [],
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
        })) || [],
      events:
        ticket.events?.map((event) => ({
          user: {
            _id: new Types.ObjectId(event.user.id),
            name: event.user.name,
            email: event.user.email,
            role: event.user.role,
          },
          type: event.type,
          data: event.data,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        })) || [],
      department: {
        _id: new Types.ObjectId(ticket.department.id),
        name: ticket.department.name,
      },
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    });
    
    const savedTicket = await newTicket.save();
    return this.mapToEntity(savedTicket);
  }

  async findById(id: string): Promise<TicketEntity | null> {
    try {
      const ticket = await this.ticketModel.findById(new Types.ObjectId(id));
      return ticket ? this.mapToEntity(ticket) : null;
    } catch (error) {
      this.logger.error(`Error finding ticket by ID: ${error.message}`, error.stack);
      return null;
    }
  }

  async findByIdAndCustomer(id: string, customerId: string): Promise<TicketEntity | null> {
    try {
      const ticket = await this.ticketModel.findOne({
        _id: new Types.ObjectId(id),
        'customer._id': new Types.ObjectId(customerId),
      });
      return ticket ? this.mapToEntity(ticket) : null;
    } catch (error) {
      this.logger.error(`Error finding ticket by ID and customer: ${error.message}`, error.stack);
      return null;
    }
  }

  async findByIdAndAgent(id: string, agentId: string): Promise<TicketEntity | null> {
    try {
      const ticket = await this.ticketModel.findOne({
        _id: new Types.ObjectId(id),
        'agent._id': new Types.ObjectId(agentId),
      });
      return ticket ? this.mapToEntity(ticket) : null;
    } catch (error) {
      this.logger.error(`Error finding ticket by ID and agent: ${error.message}`, error.stack);
      return null;
    }
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    agentId?: string;
    customerId?: string;
    companyId?: string;
    departmentId?: string;
    status?: TicketStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    tickets: TicketEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    
    const query: any = {};
    
    if (options.agentId) {
      query['agent._id'] = new Types.ObjectId(options.agentId);
    }
    
    if (options.customerId) {
      query['customer._id'] = new Types.ObjectId(options.customerId);
    }
    
    if (options.companyId) {
      query['company._id'] = new Types.ObjectId(options.companyId);
    }
    
    if (options.departmentId) {
      query['department._id'] = new Types.ObjectId(options.departmentId);
    }
    
    if (options.status) {
      query.status = options.status;
    }
    
    if (options.startDate && options.endDate) {
      query.createdAt = {
        $gte: options.startDate,
        $lte: options.endDate
      };
    }
    
    try {
      const [tickets, total] = await Promise.all([
        this.ticketModel
          .find(query)
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.ticketModel.countDocuments(query).exec()
      ]);
      
      // Mapear tickets a entidades, filtrando cualquier documento inválido
      const validTickets = [];
      for (const ticket of tickets) {
        try {
          validTickets.push(this.mapToEntity(ticket));
        } catch (err) {
          this.logger.error(`Error mapping ticket: ${err.message}`, err.stack);
          // Continúa con el siguiente ticket
        }
      }
      
      return {
        tickets: validTickets,
        total,
        page,
        limit
      };
    } catch (error) {
      this.logger.error(`Error finding tickets: ${error.message}`, error.stack);
      return {
        tickets: [],
        total: 0,
        page,
        limit
      };
    }
  }

  async update(id: string, ticket: Partial<TicketEntity>): Promise<TicketEntity | null> {
    try {
      const updateData: any = {};
      
      if (ticket.status) updateData.status = ticket.status;
      if (ticket.priority) updateData.priority = ticket.priority;
      if (ticket.subject) updateData.subject = ticket.subject;
      if (ticket.content) updateData.content = ticket.content;
      if (ticket.minutes !== undefined) updateData.minutes = ticket.minutes;
      
      updateData.updatedAt = new Date();
      
      const updatedTicket = await this.ticketModel.findByIdAndUpdate(
        new Types.ObjectId(id),
        { $set: updateData },
        { new: true }
      );
      
      return updatedTicket ? this.mapToEntity(updatedTicket) : null;
    } catch (error) {
      this.logger.error(`Error updating ticket: ${error.message}`, error.stack);
      return null;
    }
  }

  async updateStatus(id: string, status: TicketStatus): Promise<TicketEntity | null> {
    try {
      const updatedTicket = await this.ticketModel.findByIdAndUpdate(
        new Types.ObjectId(id),
        { 
          $set: { 
            status,
            updatedAt: new Date()
          } 
        },
        { new: true }
      );
      
      return updatedTicket ? this.mapToEntity(updatedTicket) : null;
    } catch (error) {
      this.logger.error(`Error updating ticket status: ${error.message}`, error.stack);
      return null;
    }
  }

  async assignAgent(id: string, agent: UserTicketEntity): Promise<TicketEntity | null> {
    try {
      const agentData = {
        _id: new Types.ObjectId(agent.id),
        name: agent.name,
        email: agent.email,
        role: agent.role,
      };
      
      const updatedTicket = await this.ticketModel.findByIdAndUpdate(
        new Types.ObjectId(id),
        { 
          $set: { 
            agent: agentData,
            updatedAt: new Date()
          } 
        },
        { new: true }
      );
      
      return updatedTicket ? this.mapToEntity(updatedTicket) : null;
    } catch (error) {
      this.logger.error(`Error assigning agent to ticket: ${error.message}`, error.stack);
      return null;
    }
  }

  async addComment(id: string, comment: CommentEntity): Promise<TicketEntity | null> {
    try {
      const commentData = {
        user: {
          _id: new Types.ObjectId(comment.user.id),
          name: comment.user.name,
          email: comment.user.email,
          role: comment.user.role,
        },
        content: comment.content,
        minutes: comment.minutes || 0,
        internal: comment.internal || false,
        files:
          comment.files?.map((file) => ({
            _id: new Types.ObjectId(file.id),
            name: file.name,
            mimetype: file.mimetype,
          })) || [],
        createdAt: comment.createdAt || new Date(),
        updatedAt: comment.updatedAt || new Date(),
      };
      
      // Primero obtenemos el ticket actual para calcular el tiempo total
      const currentTicket = await this.ticketModel.findById(new Types.ObjectId(id));
      if (!currentTicket) {
        this.logger.error(`Ticket with ID ${id} not found`);
        return null;
      }
      
      // Calculamos el nuevo tiempo total
      const currentMinutes = currentTicket.minutes || 0;
      const commentMinutes = comment.minutes || 0;
      const newTotalMinutes = currentMinutes + commentMinutes;
      
      // Actualizamos el ticket con el nuevo comentario y el tiempo total
      const updatedTicket = await this.ticketModel.findByIdAndUpdate(
        new Types.ObjectId(id),
        { 
          $push: { comments: commentData },
          $set: { 
            updatedAt: new Date(),
            minutes: newTotalMinutes  // Actualizamos el tiempo total
          }
        },
        { new: true }
      );
      
      return updatedTicket ? this.mapToEntity(updatedTicket) : null;
    } catch (error) {
      this.logger.error(`Error adding comment to ticket: ${error.message}`, error.stack);
      return null;
    }
  }

  async addEvent(id: string, event: EventEntity): Promise<TicketEntity | null> {
    try {
      const eventData = {
        user: {
          _id: new Types.ObjectId(event.user.id),
          name: event.user.name,
          email: event.user.email,
          role: event.user.role,
        },
        type: event.type,
        data: event.data,
        createdAt: event.createdAt || new Date(),
        updatedAt: event.updatedAt || new Date(),
      };
      
      const updatedTicket = await this.ticketModel.findByIdAndUpdate(
        new Types.ObjectId(id),
        { 
          $push: { events: eventData },
          $set: { updatedAt: new Date() }
        },
        { new: true }
      );
      
      return updatedTicket ? this.mapToEntity(updatedTicket) : null;
    } catch (error) {
      this.logger.error(`Error adding event to ticket: ${error.message}`, error.stack);
      return null;
    }
  }

  async countByStatusForCompany(companyId: string): Promise<Record<TicketStatus, number>> {
    try {
      const result = await this.ticketModel.aggregate([
        {
          $match: {
            'company._id': new Types.ObjectId(companyId)
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      // Initialize counts with zeros
      const counts: Record<TicketStatus, number> = {
        'open': 0,
        'closed': 0,
        'in-progress': 0,
        'pending': 0,
        'resolved': 0
      };
      
      // Update counts with actual values
      result.forEach(item => {
        counts[item._id as TicketStatus] = item.count;
      });
      
      return counts;
    } catch (error) {
      this.logger.error(`Error counting tickets by status: ${error.message}`, error.stack);
      return {
        'open': 0,
        'closed': 0,
        'in-progress': 0,
        'pending': 0,
        'resolved': 0
      };
    }
  }
  
  async findByFileId(fileId: string): Promise<TicketEntity[]> {
    try {
      const tickets = await this.ticketModel.find({
        $or: [
          { 'files._id': new Types.ObjectId(fileId) },
          { 'comments.files._id': new Types.ObjectId(fileId) }
        ]
      });
      
      return tickets.map(ticket => this.mapToEntity(ticket));
    } catch (error) {
      this.logger.error(`Error finding tickets by file ID: ${error.message}`, error.stack);
      return [];
    }
  }
}