import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TICKET_REPOSITORY, TicketRepository } from '../../domain/ports/ticket.repository';
import { TicketEntity } from '../../domain/entities/ticket.entity';
import { TicketCreatedEvent } from '../events/ticket-created.event';
import { COMPANY_PROVIDER, CompanyProvider } from '../../domain/ports/company.provider';
import { DEPARTMENT_PROVIDER, DepartmentProvider } from '../../domain/ports/department.provider';
import { FILE_PROVIDER, FileProvider } from '../../domain/ports/file.provider';
import { USER_PROVIDER, UserProvider } from '../../domain/ports/user.provider';
import { UserTicketEntity } from '../../domain/entities/user-ticket.entity';
import { FileTicketEntity } from '../../domain/entities/file-ticket.entity';
import { BadRequestException, NotFoundException } from 'src/common/exceptions';

/**
 * Use case for creating a customer ticket
 */
@Injectable()
export class CreateCustomerTicketUseCase {
  private readonly logger = new Logger(CreateCustomerTicketUseCase.name);

  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepository,
    @Inject(COMPANY_PROVIDER)
    private readonly companyProvider: CompanyProvider,
    @Inject(DEPARTMENT_PROVIDER)
    private readonly departmentProvider: DepartmentProvider,
    @Inject(FILE_PROVIDER)
    private readonly fileProvider: FileProvider,
    @Inject(USER_PROVIDER)
    private readonly userProvider: UserProvider,
    private readonly eventEmitter: EventEmitter2
  ) {}

  /**
   * Creates a new ticket for a customer
   * @param auth The authenticated user information
   * @param data The ticket data
   * @returns The created ticket entity
   */
  async execute(auth: { id: string; role: string; companyId?: string }, data: {
    subject: string;
    content: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    departmentId: string;
    files: string[];
  }): Promise<TicketEntity> {
    this.logger.debug(`Creating customer ticket for user ${auth.id}, company ${auth.companyId}`);
    
    // Validate that the user is a customer
    if (auth.role !== 'customer') {
      throw new BadRequestException('Only customers can create customer tickets', 'INVALID_ROLE');
    }
    
    // Validate that the customer has a company
    if (!auth.companyId) {
      throw new BadRequestException('Customer must belong to a company', 'NO_COMPANY');
    }
    
    // Validate file count (max 3 allowed)
    if (data.files.length > 3) {
      this.logger.warn(`File limit exceeded: ${data.files.length} files`);
      throw new BadRequestException('Maximum of 3 files allowed', 'MAX_FILES_EXCEEDED');
    }
    
    // Validate text length limits
    if (data.subject.length > 60 || data.content.length > 500) {
      this.logger.warn(`Character limit exceeded: subject=${data.subject.length}, content=${data.content.length}`);
      throw new BadRequestException('Subject or content too long', 'MAX_CHARACTERS_EXCEEDED');
    }
    
    // Run parallel queries for better performance
    try {
      const [company, user, department, files] = await Promise.all([
        // Get company information
        this.companyProvider.getById(auth.companyId),
        
        // Get user information
        this.userProvider.findById(auth.id),
        
        // Get department information
        this.departmentProvider.getById(data.departmentId),
        
        // Get files information
        this.fileProvider.getFiles(data.files)
      ]);
      
      // Validate all required entities exist
      if (!company) {
        throw new NotFoundException('Company not found', 'COMPANY_NOT_FOUND');
      }
      
      if (!user) {
        throw new NotFoundException('User not found', 'USER_NOT_FOUND');
      }
      
      if (!department) {
        throw new NotFoundException('Department not found', 'DEPARTMENT_NOT_FOUND');
      }
      
      // Map external entities to domain entities
      const companyTicket = this.companyProvider.mapToCompanyTicket(company);
      const userTicket = this.userProvider.mapToUserTicket(user);
      const departmentTicket = this.departmentProvider.mapToDepartmentTicket(department);
      const fileTickets = files.map(file => 
        new FileTicketEntity({
          id: file.id,
          name: file.name,
          mimetype: file.mimetype
        })
      );
      
      // Create ticket entity
      const ticket = new TicketEntity({
        status: 'open',
        priority: data.priority,
        company: companyTicket,
        customer: userTicket,
        subject: data.subject,
        content: data.content,
        content_user: userTicket,
        department: departmentTicket,
        files: fileTickets,
      });
      
      // Save the ticket
      const createdTicket = await this.ticketRepository.create(ticket);
      
      // Mark files as active (in use)
      await this.fileProvider.activateFiles(data.files);
      
      // Emit created event
      this.eventEmitter.emit(
        'ticket.created',
        new TicketCreatedEvent(
          createdTicket.id,
          {
            status: createdTicket.status,
            priority: createdTicket.priority,
            subject: createdTicket.subject,
            companyId: createdTicket.company.id,
            customerId: createdTicket.customer.id,
            departmentId: createdTicket.department.id,
          }
        )
      );
      
      return createdTicket;
    } catch (error) {
      this.logger.error(`Error creating ticket: ${error.message}`, error.stack);
      throw error;
    }
  }
}