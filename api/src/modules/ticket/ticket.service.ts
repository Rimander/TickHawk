import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateCustomerTicketDto } from './dto/in/create-customer-ticket.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Ticket } from './schemas/ticket.schema';
import mongoose, { Model, Types } from 'mongoose';
import { DepartmentService } from '../department/department.service';
import { CompanyServiceAdapter } from './ticket.service.adapter';
import {
  CompanyTicket,
  CompanyTicketSchema,
} from './schemas/company-ticket.schema';
import { plainToInstance } from 'class-transformer';
import { UserTicket, UserTicketSchema } from './schemas/user-ticket.schema';
import {
  DepartmentTicket,
  DepartmentTicketSchema,
} from './schemas/department-ticket.schema';
import { UserService } from '../user/user.service';
import { CreateTicketDto } from './dto/in/create-ticket.dto';
import { TicketDto } from './dto/out/ticket.dto';
import { FileTicket, FileTicketSchema } from './schemas/file-ticket.schema';
import { FileService } from '../file/file.service';
import { ReplyCommentCustomerTicketDto } from './dto/in/reply-comment-customer-ticket.dto';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { Event, EventSchema } from './schemas/event.schema';
import { UpdateTicketStatusDto } from './dto/in/update-ticket-status.dto';
import { AssignAgentDto } from './dto/in/assign-agent.dto';
import { AgentReplyTicketDto } from './dto/in/agent-reply-ticket.dto';

/**
 * Interface for authenticated user data
 */
interface AuthDto {
  id: string;
  role: string;
  companyId?: string;
}

/**
 * Service responsible for managing tickets in the TickHawk platform.
 * Handles CRUD operations and business logic for tickets, including customer
 * and agent interactions, file attachments, and reporting.
 */
@Injectable()
export class TicketService {
  private readonly companyModel: Model<CompanyTicket>;
  private readonly userTicketModel: Model<UserTicket>;
  private readonly departmentTicketModel: Model<DepartmentTicket>;
  private readonly fileTicketModel: Model<FileTicket>;
  private readonly commentTicketModel: Model<Comment>;
  private readonly eventTicketModel: Model<Event>;
  private readonly logger = new Logger(TicketService.name);

  constructor(
    @InjectModel(Ticket.name) private readonly ticketModel: Model<Ticket>,
    private readonly departmentService: DepartmentService,
    private readonly companyService: CompanyServiceAdapter,
    private readonly userService: UserService,
    private readonly fileService: FileService,
  ) {
    // Initialize related models
    this.companyModel = mongoose.model(CompanyTicket.name, CompanyTicketSchema);
    this.userTicketModel = mongoose.model(UserTicket.name, UserTicketSchema);
    this.fileTicketModel = mongoose.model(FileTicket.name, FileTicketSchema);
    this.commentTicketModel = mongoose.model(Comment.name, CommentSchema);
    this.eventTicketModel = mongoose.model(Event.name, EventSchema);
    this.departmentTicketModel = mongoose.model(
      DepartmentTicket.name,
      DepartmentTicketSchema,
    );
  }

  /**
   * Creates a new ticket as a customer
   * 
   * This method validates input data, checks permissions, and creates a new
   * ticket in the system with appropriate relationships to company, department,
   * and attached files.
   * 
   * @param auth - The authenticated user's information (customer)
   * @param createTicket - The ticket data to create
   * @returns A DTO representing the created ticket
   * @throws HttpException if validation fails or entities not found
   */
  async createCustomerTicket(
    auth: AuthDto,
    createTicket: CreateCustomerTicketDto,
  ): Promise<TicketDto> {
    try {
      this.logger.debug(`Creating customer ticket for user ${auth.id}, company ${auth.companyId}`);
      
      // Validate file count (max 3 allowed)
      if (createTicket.files.length > 3) {
        this.logger.warn(`File limit exceeded: ${createTicket.files.length} files`);
        throw new HttpException('MAX_FILES_EXCEEDED', 400);
      }
      
      // Validate text length limits
      if (createTicket.subject.length > 60 || createTicket.content.length > 500) {
        this.logger.warn(`Character limit exceeded: subject=${createTicket.subject.length}, content=${createTicket.content.length}`);
        throw new HttpException('MAX_CHARACTERS_EXCEEDED', 400);
      }
      
      // Run parallel queries for better performance
      const [company, user, department, files] = await Promise.all([
        // Get company information
        this.companyService.getById(auth.companyId),
        
        // Get user information
        this.userService.findById(new Types.ObjectId(auth.id)),
        
        // Get department information
        this.departmentService.getById(createTicket.departmentId),
        
        // Get files information
        this.fileService.getFiles(createTicket.files)
      ]);
      
      // Validate all required entities exist
      if (!company) {
        throw new HttpException('COMPANY_NOT_FOUND', 404);
      }
      
      if (!user) {
        throw new HttpException('USER_NOT_FOUND', 404);
      }
      
      if (!department) {
        throw new HttpException('DEPARTMENT_NOT_FOUND', 404);
      }
      
      if (!files) {
        throw new HttpException('FILES_NOT_FOUND', 404);
      }

      // Create and save the ticket
      const ticket = new this.ticketModel({
        status: 'open',
        priority: createTicket.priority,
        company: plainToInstance(this.companyModel, company),
        customer: plainToInstance(this.userTicketModel, user),
        subject: createTicket.subject,
        content: createTicket.content,
        content_user: plainToInstance(this.userTicketModel, user),
        department: plainToInstance(this.departmentTicketModel, department),
        files: files.map((file) => plainToInstance(this.fileTicketModel, file)),
      });
      
      const newTicket = await ticket.save();
      
      // Mark files as active (in use)
      await this.fileService.activeFiles(createTicket.files);
      
      this.logger.debug(`Created ticket with ID: ${newTicket._id}`);
      
      // Return the full ticket details
      return this.getCustomerTicketById(auth, newTicket._id.toString());
    } catch (error) {
      // Log error details but keep message simple for client
      this.logger.error(`Error creating ticket: ${error.message}`, error.stack);
      
      // Re-throw HTTP exceptions as-is
      if (error instanceof HttpException) {
        throw error;
      }
      
      // Generic error for unexpected issues
      throw new HttpException('TICKET_NOT_CREATED', 500);
    }
  }

  /**
   * Allows a customer to reply to their own ticket
   * 
   * Validates the reply content and files, adds the comment to the ticket,
   * and ensures only open tickets can receive replies.
   * 
   * @param auth - The authenticated customer's information
   * @param replyCommentCustomerTicketDto - The reply content and attached files
   * @returns Updated ticket DTO with the new comment
   * @throws HttpException for validation failures or if ticket is closed
   */
  async replyToCustomerTicket(
    auth: AuthDto,
    replyCommentCustomerTicketDto: ReplyCommentCustomerTicketDto,
  ): Promise<TicketDto> {
    try {
      this.logger.debug(`Customer ${auth.id} replying to ticket ${replyCommentCustomerTicketDto._id}`);
      
      // Validate input
      if (replyCommentCustomerTicketDto.files?.length > 3) {
        this.logger.warn(`Customer reply file limit exceeded: ${replyCommentCustomerTicketDto.files.length} files`);
        throw new HttpException('MAX_FILES_EXCEEDED', 400);
      }

      if (replyCommentCustomerTicketDto.content?.length > 500) {
        this.logger.warn(`Customer reply content too long: ${replyCommentCustomerTicketDto.content.length} chars`);
        throw new HttpException('MAX_CHARACTERS_EXCEEDED', 400);
      }

      // Run queries in parallel for better performance
      const [user, files, ticket] = await Promise.all([
        // Get user information
        this.userService.findById(new Types.ObjectId(auth.id)),
        
        // Get files information (if any)
        replyCommentCustomerTicketDto.files?.length > 0 
          ? this.fileService.getFiles(replyCommentCustomerTicketDto.files)
          : [],
          
        // Get ticket
        this.ticketModel.findOne({
          _id: new Types.ObjectId(replyCommentCustomerTicketDto._id),
          'customer._id': new Types.ObjectId(auth.id) // Security: Ensure this is the customer's ticket
        })
      ]);

      // Validate entities
      if (!user) {
        throw new HttpException('USER_NOT_FOUND', 404);
      }

      if (!ticket) {
        throw new HttpException('TICKET_NOT_FOUND', 404);
      }

      if (replyCommentCustomerTicketDto.files?.length > 0 && !files) {
        throw new HttpException('FILES_NOT_FOUND', 404);
      }

      // Validate ticket status
      if (ticket.status !== 'open') {
        this.logger.warn(`Cannot reply to closed ticket: ${ticket._id}`);
        throw new HttpException('TICKET_NOT_OPEN', 400);
      }

      // Create and add the comment
      const comment = plainToInstance(this.commentTicketModel, {
        user: plainToInstance(this.userTicketModel, user),
        content: replyCommentCustomerTicketDto.content,
        files: files?.map(file => plainToInstance(this.fileTicketModel, file)) || [],
        createdAt: new Date(),
        updatedAt: new Date()
      }) as any;

      ticket.comments.push(comment);
      ticket.updatedAt = new Date(); // Update the ticket's last update time

      // Mark files as active (if any)
      if (replyCommentCustomerTicketDto.files?.length > 0) {
        await this.fileService.activeFiles(replyCommentCustomerTicketDto.files);
      }

      const ticketSaved = await ticket.save();
      this.logger.debug(`Customer replied to ticket ${ticketSaved._id}, comment count: ${ticketSaved.comments.length}`);
      
      return this.getCustomerTicketById(auth, ticketSaved._id.toString());
    } catch (error) {
      this.logger.error(`Error in customer reply: ${error.message}`, error.stack);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException('FAILED_TO_REPLY', 500);
    }
  }

  /**
   * Allows a customer to close their own ticket
   * 
   * Checks if the ticket exists, belongs to the customer, and is not already closed.
   * Creates a 'close' event and updates the ticket status.
   * 
   * @param auth - The authenticated customer's information
   * @param id - The ID of the ticket to close
   * @returns Updated ticket DTO with closed status
   * @throws HttpException if ticket not found, already closed, or user not found
   */
  async closeCustomerTicket(auth: AuthDto, id: string): Promise<TicketDto> {
    try {
      this.logger.debug(`Customer ${auth.id} attempting to close ticket ${id}`);
      
      // Find ticket ensuring it belongs to the requesting customer
      const ticket = await this.ticketModel.findOne({
        _id: new Types.ObjectId(id),
        'customer._id': new Types.ObjectId(auth.id),
      });

      if (!ticket) {
        this.logger.warn(`Ticket not found or doesn't belong to customer: ${id}`);
        throw new HttpException('TICKET_NOT_FOUND', 404);
      }

      // Check if already closed
      if (ticket.status === 'closed') {
        this.logger.warn(`Attempt to close already closed ticket: ${id}`);
        throw new HttpException('TICKET_ALREADY_CLOSED', 400);
      }

      // Get user info for the event
      const user = await this.userService.findById(new Types.ObjectId(auth.id));
      if (!user) {
        throw new HttpException('USER_NOT_FOUND', 404);
      }
      
      // Create and add closure event
      const event = plainToInstance(this.eventTicketModel, {
        user: plainToInstance(this.userTicketModel, user),
        type: 'close',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      ticket.events.push(event);
      ticket.status = 'closed';
      ticket.updatedAt = new Date();
      
      const ticketSaved = await ticket.save();
      
      this.logger.debug(`Ticket ${id} closed by customer ${auth.id}`);
      
      return plainToInstance(TicketDto, ticketSaved.toJSON(), {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      this.logger.error(`Error closing ticket: ${error.message}`, error.stack);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException('FAILED_TO_CLOSE_TICKET', 500);
    }
  }

  /**
   * Creates a ticket on behalf of a customer as an agent or admin
   * 
   * Validates input data, ensures the customer exists and has a company,
   * and creates a new ticket in the system with appropriate relationships.
   * 
   * @param auth - The authenticated admin/agent user information
   * @param createTicket - The ticket data to create
   * @returns A DTO representing the created ticket
   * @throws HttpException for validation failures or entities not found
   */
  async createTicket(auth: AuthDto, createTicket: CreateTicketDto): Promise<TicketDto> {
    try {
      this.logger.debug(`Agent/Admin ${auth.id} creating ticket for customer ${createTicket.customerId}`);
      
      // Validate required fields
      if (!createTicket.subject || !createTicket.content || !createTicket.departmentId || 
          !createTicket.customerId || !createTicket.status || !createTicket.priority) {
        this.logger.warn('Missing required fields in create ticket request');
        throw new HttpException('Missing required fields', 400);
      }
      
      // Run parallel queries for better performance
      const [agent, customer] = await Promise.all([
        // Get agent/admin information
        this.userService.findById(new Types.ObjectId(auth.id)),
        
        // Get customer information
        this.userService.findById(new Types.ObjectId(createTicket.customerId))
      ]);
      
      // Validate users exist
      if (!agent) {
        throw new HttpException('Agent not found', 404);
      }
      
      if (!customer) {
        throw new HttpException('Customer not found', 404);
      }
      
      // Ensure customer has a company
      if (!customer.companyId) {
        this.logger.warn(`Customer ${customer._id} has no company assigned`);
        throw new HttpException('Customer has no company assigned', 400);
      }
      
      // Run more parallel queries for company and department
      const customerCompanyId = customer.companyId.toString();
      const [company, department] = await Promise.all([
        // Get company information
        this.companyService.getById(customerCompanyId),
        
        // Get department information
        this.departmentService.getById(createTicket.departmentId)
      ]);
      
      // Validate entities exist
      if (!company) {
        throw new HttpException('Customer company not found', 404);
      }
      
      if (!department) {
        throw new HttpException('Department not found', 404);
      }
      
      // Create the ticket with proper relationships
      const ticket = new this.ticketModel({
        status: createTicket.status,
        priority: createTicket.priority,
        company: plainToInstance(this.companyModel, company),
        agent: plainToInstance(this.userTicketModel, agent), // Assign creating agent
        customer: plainToInstance(this.userTicketModel, customer),
        subject: createTicket.subject,
        content: createTicket.content,
        content_user: plainToInstance(this.userTicketModel, agent), // Creator
        department: plainToInstance(this.departmentTicketModel, department),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Create an event to track ticket creation
      const event = plainToInstance(this.eventTicketModel, {
        user: plainToInstance(this.userTicketModel, agent),
        type: 'create',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      ticket.events = [event];
      
      // Save the ticket
      const newTicket = await ticket.save();
      
      this.logger.debug(`Created ticket with ID: ${newTicket._id} by agent ${auth.id}`);
      
      // Return the full ticket details
      return this.getTicketById(auth, newTicket._id.toString());
    } catch (error) {
      // Log error details but keep message simple for client
      this.logger.error(`Error in agent createTicket: ${error.message}`, error.stack);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(`Failed to create ticket`, 500);
    }
  }

  /**
   * Retrieves a ticket by ID for an agent or admin with role-based access control
   * 
   * Agents can only access tickets assigned to them, while admins can access any ticket.
   * 
   * @param auth - The authenticated user's information (agent or admin)
   * @param id - The ID of the ticket to retrieve
   * @returns The ticket DTO if found and accessible
   * @throws HttpException if ticket not found or not accessible
   */
  async getTicketById(auth: AuthDto, id: string): Promise<TicketDto> {
    try {
      this.logger.debug(`User ${auth.id} (${auth.role}) retrieving ticket ${id}`);
      
      // Build query based on user role
      const query: any = {
        _id: new Types.ObjectId(id)
      };
      
      // Role-based access control
      if (auth.role === 'agent') {
        // Agents can only access tickets assigned to them
        query['agent._id'] = new Types.ObjectId(auth.id);
      } else if (auth.role === 'admin' && auth.companyId) {
        // If admin belongs to a company, only show tickets for that company
        query['company._id'] = new Types.ObjectId(auth.companyId);
      }
      // Super admins without company can see all tickets

      const ticket = await this.ticketModel.findOne(query);

      if (!ticket) {
        this.logger.warn(`Ticket ${id} not found or not accessible by user ${auth.id}`);
        throw new HttpException('TICKET_NOT_FOUND', 404);
      }

      return plainToInstance(TicketDto, ticket.toJSON(), {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      this.logger.error(`Error retrieving ticket ${id}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException('FAILED_TO_RETRIEVE_TICKET', 500);
    }
  }

  /**
   * Retrieves a paginated list of tickets with optional filters
   * 
   * For agents, only returns tickets assigned to them.
   * For admins, returns all tickets (with optional company filter).
   * Supports filtering by department and company.
   * 
   * @param auth - The authenticated user's information
   * @param page - Page number for pagination (1-based)
   * @param departmentId - Optional department ID to filter by
   * @param companyId - Optional company ID to filter by
   * @returns Array of ticket DTOs matching the criteria
   */
  async getTickets(
    auth: AuthDto, 
    page: number, 
    departmentId?: string, 
    companyId?: string
  ): Promise<TicketDto[]> {
    try {
      const limit = 15; // Items per page
      
      // Build the query based on user role and filters
      const query: any = {};
      let filterDescription = '';
      
      // Role-based access control
      if (auth.role === 'agent') {
        // Agents can only see tickets assigned to them
        query['agent._id'] = new Types.ObjectId(auth.id);
        filterDescription += `agent=${auth.id}`;
      } else if (auth.role === 'admin' && auth.companyId && !companyId) {
        // If admin belongs to a company and no specific company requested,
        // default to admin's company
        query['company._id'] = new Types.ObjectId(auth.companyId);
        filterDescription += `company=${auth.companyId}`;
      }
      
      // Apply department filter if provided
      if (departmentId) {
        query['department._id'] = new Types.ObjectId(departmentId);
        filterDescription += `, department=${departmentId}`;
      }
      
      // Apply company filter if provided (overrides default company for admin)
      if (companyId) {
        query['company._id'] = new Types.ObjectId(companyId);
        filterDescription += `, company=${companyId}`;
      }
      
      this.logger.debug(`Retrieving tickets: page=${page}, filters=[${filterDescription}]`);
      
      // Execute query with pagination
      const tickets = await this.ticketModel
        .find(query)
        .sort({ updatedAt: -1 }) // Sort by last update time instead of creation time
        .limit(limit)
        .skip((page - 1) * limit)
        .lean() // Use lean for better performance as we don't need Mongoose methods
        .exec();
      
      this.logger.debug(`Retrieved ${tickets.length} tickets for page ${page}`);
      
      // Transform to DTOs
      return plainToInstance(
        TicketDto,
        tickets,
        {
          excludeExtraneousValues: true,
        },
      );
    } catch (error) {
      this.logger.error(`Error retrieving tickets: ${error.message}`, error.stack);
      throw new HttpException('FAILED_TO_RETRIEVE_TICKETS', 500);
    }
  }

  /**
   * Retrieves a specific ticket for a customer
   * 
   * Security is enforced by ensuring the ticket belongs to the requesting customer.
   * 
   * @param auth - The authenticated customer's information
   * @param id - The ID of the ticket to retrieve
   * @returns The ticket DTO if found and belongs to the customer
   * @throws HttpException if ticket not found or doesn't belong to the customer
   */
  async getCustomerTicketById(auth: AuthDto, id: string): Promise<TicketDto> {
    try {
      this.logger.debug(`Customer ${auth.id} retrieving ticket ${id}`);
      
      // Find ticket ensuring it belongs to the requesting customer
      const ticket = await this.ticketModel.findOne({
        _id: new Types.ObjectId(id),
        'customer._id': new Types.ObjectId(auth.id),
      }).lean(); // Use lean for better performance

      if (!ticket) {
        this.logger.warn(`Ticket ${id} not found or doesn't belong to customer ${auth.id}`);
        throw new HttpException('TICKET_NOT_FOUND', 404);
      }

      return plainToInstance(TicketDto, ticket, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      this.logger.error(`Error retrieving customer ticket: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException('FAILED_TO_RETRIEVE_TICKET', 500);
    }
  }

  /**
   * Retrieves a paginated list of tickets for a customer
   * 
   * Returns only tickets belonging to the authenticated customer,
   * sorted by last update time (most recent first).
   * 
   * @param auth - The authenticated customer's information
   * @param page - Page number for pagination (1-based)
   * @returns Array of ticket DTOs belonging to the customer
   */
  async getCustomerTickets(auth: AuthDto, page: number): Promise<TicketDto[]> {
    try {
      this.logger.debug(`Retrieving tickets for customer ${auth.id}, page ${page}`);
      
      const limit = 10; // Items per page
      
      // Find tickets belonging to this customer
      const tickets = await this.ticketModel
        .find({
          'customer._id': new Types.ObjectId(auth.id),
        })
        .sort({ updatedAt: -1 }) // Sort by latest update rather than creation
        .limit(limit)
        .skip((page - 1) * limit)
        .lean() // Use lean for better performance
        .exec();

      this.logger.debug(`Retrieved ${tickets.length} tickets for customer ${auth.id}`);
      
      return plainToInstance(
        TicketDto,
        tickets,
        {
          excludeExtraneousValues: true,
        },
      );
    } catch (error) {
      this.logger.error(`Error retrieving customer tickets: ${error.message}`, error.stack);
      throw new HttpException('FAILED_TO_RETRIEVE_TICKETS', 500);
    }
  }

  /**
   * Get a ticket of the customer
   * @param auth
   * @param id
   * @returns
   */
  async getCustomerTicket(auth: AuthDto, id: string): Promise<TicketDto> {
    const ticket = await this.ticketModel.findOne({
      _id: new Types.ObjectId(id),
      'customer._id': new Types.ObjectId(auth.id),
    });

    if (!ticket) {
      throw new HttpException('TICKET_NOT_FOUND', 404);
    }

    return plainToInstance(TicketDto, ticket.toJSON(), {
      excludeExtraneousValues: true,
    });
  }

  async downloadFile(auth: AuthDto, file: string) {
    const userId = auth.id;

    // Customer or agent id, and file id in files
    const ticket = await this.ticketModel.findOne({
      $and: [
        {
          $or: [
            { 'customer._id': new Types.ObjectId(userId) },
            { 'agent._id': new Types.ObjectId(userId) },
          ],
        },
        {
          $or: [
            { files: { $elemMatch: { _id: new Types.ObjectId(file) } } },
            {
              'comments.files': {
                $elemMatch: { _id: new Types.ObjectId(file) },
              },
            },
          ],
        },
      ],
    });

    if (!ticket) {
      throw new HttpException('TICKET_NOT_FOUND', 404);
    }

    const fileTicket = await this.fileService.getFile(file);

    if (!fileTicket) {
      throw new HttpException('FILE_NOT_FOUND', 404);
    }
    return fileTicket;
  }

  /**
   * Update the status of a ticket
   * @param auth The authenticated user (admin or agent)
   * @param id The ticket ID
   * @param updateStatusDto The new status
   * @returns Updated ticket
   */
  async updateTicketStatus(
    auth: AuthDto, 
    id: string, 
    updateStatusDto: UpdateTicketStatusDto
  ): Promise<TicketDto> {
    // Build query based on role
    const query: any = {
      _id: new Types.ObjectId(id)
    };
    
    // If agent, only allow updating tickets assigned to them
    if (auth.role === 'agent') {
      query['agent._id'] = new Types.ObjectId(auth.id);
    }

    const ticket = await this.ticketModel.findOne(query);

    if (!ticket) {
      throw new HttpException('TICKET_NOT_FOUND', 404);
    }

    // Don't allow updating if ticket is already closed
    if (ticket.status === 'closed') {
      throw new HttpException('TICKET_ALREADY_CLOSED', 400);
    }

    // Don't do anything if status is the same
    if (ticket.status === updateStatusDto.status) {
      return plainToInstance(TicketDto, ticket.toJSON(), {
        excludeExtraneousValues: true,
      });
    }

    // Get user data for the event
    const user = await this.userService.findById(new Types.ObjectId(auth.id));
    if (!user) {
      throw new HttpException('USER_NOT_FOUND', 404);
    }

    // Create event to track status change
    const event = plainToInstance(this.eventTicketModel, {
      user: plainToInstance(this.userTicketModel, user),
      type: 'status-change',
      data: {
        oldStatus: ticket.status,
        newStatus: updateStatusDto.status
      }
    });

    // Update ticket status and add event
    ticket.status = updateStatusDto.status;
    ticket.events.push(event);
    const updatedTicket = await ticket.save();

    return plainToInstance(TicketDto, updatedTicket.toJSON(), {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Assign a ticket to a different agent
   * @param auth The authenticated user (admin or agent)
   * @param id The ticket ID
   * @param assignAgentDto Contains the ID of the agent to assign
   * @returns Updated ticket
   */
  async assignTicketToAgent(
    auth: AuthDto, 
    id: string, 
    assignAgentDto: AssignAgentDto
  ): Promise<TicketDto> {
    // Build query based on role
    const query: any = {
      _id: new Types.ObjectId(id)
    };
    
    // If agent, only allow transferring tickets assigned to them
    if (auth.role === 'agent') {
      query['agent._id'] = new Types.ObjectId(auth.id);
    }

    const ticket = await this.ticketModel.findOne(query);

    if (!ticket) {
      throw new HttpException('TICKET_NOT_FOUND', 404);
    }

    // Don't allow updating if ticket is closed
    if (ticket.status === 'closed') {
      throw new HttpException('TICKET_ALREADY_CLOSED', 400);
    }

    // Get the new agent data
    const newAgent = await this.userService.findById(
      new Types.ObjectId(assignAgentDto.agentId)
    );
    
    if (!newAgent) {
      throw new HttpException('AGENT_NOT_FOUND', 404);
    }

    // Verify the agent has the right role
    if (newAgent.role !== 'agent' && newAgent.role !== 'admin') {
      throw new HttpException('INVALID_AGENT_ROLE', 400);
    }

    // Get current user data for the event
    const currentUser = await this.userService.findById(new Types.ObjectId(auth.id));
    if (!currentUser) {
      throw new HttpException('USER_NOT_FOUND', 404);
    }

    // Store old agent info for the event
    const oldAgent = ticket.agent ? { 
      _id: ticket.agent._id,
      name: ticket.agent.name 
    } : null;

    // Create event to track agent assignment
    const event = plainToInstance(this.eventTicketModel, {
      user: plainToInstance(this.userTicketModel, currentUser),
      type: 'assign-agent',
      data: {
        oldAgent: oldAgent,
        newAgent: {
          _id: newAgent._id,
          name: newAgent.name
        }
      }
    });

    // Update ticket agent and add event
    ticket.agent = plainToInstance(this.userTicketModel, newAgent);
    ticket.events.push(event);
    const updatedTicket = await ticket.save();

    return plainToInstance(TicketDto, updatedTicket.toJSON(), {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Reply to a ticket as an agent or admin
   * @param auth The authenticated user (agent or admin)
   * @param agentReplyDto The reply information
   * @returns Updated ticket
   */
  async replyToTicketAsAgent(
    auth: AuthDto,
    agentReplyDto: AgentReplyTicketDto,
  ): Promise<TicketDto> {
    // Verify max files
    if (agentReplyDto.files.length > 3) {
      throw new HttpException('MAX_FILES_EXCEEDED', 400);
    }

    // Verify content length
    if (agentReplyDto.content.length > 500) {
      throw new HttpException('MAX_CHARACTERS_EXCEEDED', 400);
    }

    // Build query based on role
    const query: any = {
      _id: new Types.ObjectId(agentReplyDto._id)
    };
    
    // If agent, only allow replying to tickets assigned to them
    if (auth.role === 'agent') {
      query['agent._id'] = new Types.ObjectId(auth.id);
    }

    const ticket = await this.ticketModel.findOne(query);

    if (!ticket) {
      throw new HttpException('TICKET_NOT_FOUND', 404);
    }

    // Don't allow replying if ticket is closed
    if (ticket.status === 'closed') {
      throw new HttpException('TICKET_ALREADY_CLOSED', 400);
    }

    // Check if the user exists
    const user = await this.userService.findById(new Types.ObjectId(auth.id));
    if (!user) {
      throw new HttpException('USER_NOT_FOUND', 404);
    }

    // Check if the files exist
    const files = await this.fileService.getFiles(
      agentReplyDto.files,
    );
    if (!files) {
      throw new HttpException('FILES_NOT_FOUND', 404);
    }

    // Create the comment with the current user as the commenter
    const comment = plainToInstance(this.commentTicketModel, {
      user: plainToInstance(this.userTicketModel, user),
      content: agentReplyDto.content,
      hours: agentReplyDto.hours || 0,
      files: files.map((file) => plainToInstance(this.fileTicketModel, file)),
    }) as any;

    ticket.comments.push(comment);

    const ticketSaved = await ticket.save();
    return this.getTicketById(auth, ticketSaved._id.toString());
  }

  /**
   * Get tickets filtered by company and date range for reports
   * @param auth The authenticated user
   * @param startDate Start date for filtering
   * @param endDate End date for filtering
   * @param page Page number
   * @param companyId Optional company ID for admins/agents
   * @returns Filtered tickets
   */
  async getTicketsByCompanyWithDateFilter(
    auth: AuthDto, 
    startDate: string, 
    endDate: string, 
    page: number,
    companyId?: string
  ): Promise<TicketDto[]> {
    const limit = 50; // Higher limit for reports
    
    // Build the query based on user role and company
    const query: any = {};
    
    // For customers, only show tickets from their company
    if (auth.role === 'customer') {
      query['company._id'] = new Types.ObjectId(auth.companyId);
    } else if (auth.role === 'agent') {
      // For agents
      if (companyId) {
        // If specific company is requested and agent belongs to the company
        query['company._id'] = new Types.ObjectId(companyId);
      } else {
        // Otherwise show tickets from their company
        query['company._id'] = new Types.ObjectId(auth.companyId);
      }
      // Always filter by agent
      query['agent._id'] = new Types.ObjectId(auth.id);
    } else if (auth.role === 'admin') {
      // For admins
      if (companyId) {
        // If specific company is requested
        query['company._id'] = new Types.ObjectId(companyId);
      } else if (auth.companyId) {
        // For admins with a company, use their company as default
        query['company._id'] = new Types.ObjectId(auth.companyId);
      }
      // Admins without a company and no company specified can see tickets from all companies
    }
    
    // Add date range filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const tickets = await this.ticketModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    return plainToInstance(
      TicketDto,
      tickets.map((ticket) => ticket.toJSON()),
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
