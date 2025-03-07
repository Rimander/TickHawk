import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TICKET_REPOSITORY, TicketRepository } from '../../domain/ports/ticket.repository';
import { CommentEntity } from '../../domain/entities/comment.entity';
import { FILE_PROVIDER, FileProvider } from '../../domain/ports/file.provider';
import { USER_PROVIDER, UserProvider } from '../../domain/ports/user.provider';
import { FileTicketEntity } from '../../domain/entities/file-ticket.entity';
import { BadRequestException, NotFoundException } from 'src/common/exceptions';
import { TicketRepliedEvent } from '../events/ticket-replied.event';

/**
 * Use case for replying to a customer ticket
 */
@Injectable()
export class ReplyCustomerTicketUseCase {
  private readonly logger = new Logger(ReplyCustomerTicketUseCase.name);

  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepository,
    @Inject(FILE_PROVIDER)
    private readonly fileProvider: FileProvider,
    @Inject(USER_PROVIDER)
    private readonly userProvider: UserProvider,
    private readonly eventEmitter: EventEmitter2
  ) {}

  /**
   * Adds a reply to an existing ticket
   * @param auth The authenticated user information
   * @param data Reply data
   * @returns The updated ticket
   */
  async execute(auth: { id: string; role: string; companyId?: string }, data: {
    _id: string;
    content: string;
    files: string[];
  }) {
    this.logger.debug(`Customer ${auth.id} replying to ticket ${data._id}`);
    
    // Validate that the user is a customer
    if (auth.role !== 'customer') {
      throw new BadRequestException('Only customers can reply to customer tickets', 'INVALID_ROLE');
    }
    
    // Validate file count (max 3 allowed)
    if (data.files?.length > 3) {
      this.logger.warn(`File limit exceeded: ${data.files.length} files`);
      throw new BadRequestException('Maximum of 3 files allowed', 'MAX_FILES_EXCEEDED');
    }
    
    // Validate content length
    if (data.content?.length > 500) {
      this.logger.warn(`Content too long: ${data.content.length} chars`);
      throw new BadRequestException('Content text is too long', 'MAX_CHARACTERS_EXCEEDED');
    }

    try {
      // Find the ticket
      const ticket = await this.ticketRepository.findByIdAndCustomer(data._id, auth.id);
      
      if (!ticket) {
        throw new NotFoundException('Ticket not found or does not belong to this customer', 'TICKET_NOT_FOUND');
      }
      
      // Check if ticket is open
      if (ticket.status === 'closed') {
        throw new BadRequestException('Cannot reply to a closed ticket', 'TICKET_NOT_OPEN');
      }
      
      // Get user information
      const user = await this.userProvider.findById(auth.id);
      
      if (!user) {
        throw new NotFoundException('User not found', 'USER_NOT_FOUND');
      }
      
      // Get files if any
      const fileEntities = data.files?.length > 0 
        ? await this.fileProvider.getFiles(data.files)
        : [];
      
      // Create file entities
      const fileTickets = fileEntities.map(file => 
        new FileTicketEntity({
          id: file.id,
          name: file.name,
          mimetype: file.mimetype
        })
      );
      
      // Create comment entity
      const userTicket = this.userProvider.mapToUserTicket(user);
      const comment = new CommentEntity({
        user: userTicket,
        content: data.content,
        files: fileTickets,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Add comment to ticket
      const updatedTicket = await this.ticketRepository.addComment(ticket.id, comment);
      
      // Mark files as active
      if (data.files?.length > 0) {
        await this.fileProvider.activateFiles(data.files);
      }
      
      // Emit event
      this.eventEmitter.emit(
        'ticket.replied',
        new TicketRepliedEvent(
          updatedTicket.id,
          {
            repliedBy: auth.id,
            repliedByRole: auth.role,
            companyId: updatedTicket.company.id,
            customerId: updatedTicket.customer.id,
            agentId: updatedTicket.agent?.id,
            commentId: comment.id,
            hasFiles: fileTickets.length > 0
          }
        )
      );
      
      return updatedTicket;
    } catch (error) {
      this.logger.error(`Error replying to ticket: ${error.message}`, error.stack);
      throw error;
    }
  }
}