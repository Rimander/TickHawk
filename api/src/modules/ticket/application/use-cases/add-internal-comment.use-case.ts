import { Inject, Injectable, Logger } from '@nestjs/common';
import { TICKET_REPOSITORY, TicketRepository } from '../../domain/ports/ticket.repository';
import { FILE_PROVIDER, FileProvider } from '../../domain/ports/file.provider';
import { TicketEntity } from '../../domain/entities/ticket.entity';
import { UserTicketEntity } from '../../domain/entities/user-ticket.entity';
import { CommentEntity } from '../../domain/entities/comment.entity';
import { FileTicketEntity } from '../../domain/entities/file-ticket.entity';
import { BadRequestException, ForbiddenException, NotFoundException } from 'src/common/exceptions';

interface InternalCommentParams {
  _id: string;
  content: string;
  minutes?: number;
  files?: string[];
}

/**
 * Use case for adding an internal comment to a ticket (only visible to agents/admins)
 */
@Injectable()
export class AddInternalCommentUseCase {
  private readonly logger = new Logger(AddInternalCommentUseCase.name);

  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepository,
    @Inject(FILE_PROVIDER)
    private readonly fileProvider: FileProvider
  ) {}

  /**
   * Add an internal comment to a ticket (only visible to agents/admins)
   * @param auth The authenticated user information
   * @param commentParams Comment parameters
   * @returns The updated ticket
   */
  async execute(
    auth: { id: string; role: string; name?: string; email?: string; companyId?: string }, 
    commentParams: InternalCommentParams
  ): Promise<TicketEntity> {
    const { _id, content, minutes, files } = commentParams;
    this.logger.debug(`User ${auth.id} adding internal comment to ticket ${_id}`);
    
    // Only agents and admins can add internal comments
    if (auth.role !== 'agent' && auth.role !== 'admin') {
      throw new ForbiddenException('Only agents and admins can add internal comments', 'INSUFFICIENT_PERMISSIONS');
    }
    
    try {
      // Find the ticket
      const ticket = await this.ticketRepository.findById(_id);
      
      if (!ticket) {
        throw new NotFoundException('Ticket not found', 'TICKET_NOT_FOUND');
      }
      
      // For agents, check company access
      if (auth.role === 'agent' && auth.companyId && ticket.company.id !== auth.companyId) {
        throw new ForbiddenException('Cannot access tickets from another company', 'COMPANY_MISMATCH');
      }
      
      // Process files if provided
      let fileEntities: FileTicketEntity[] = [];
      if (files && files.length > 0) {
        // Check if all files exist
        for (const fileId of files) {
          const exists = await this.fileProvider.fileExists(fileId);
          if (!exists) {
            throw new NotFoundException(`File with ID ${fileId} not found`, 'FILE_NOT_FOUND');
          }
        }
        
        // Get file details
        const fileDetails = await this.fileProvider.getFiles(files);
        fileEntities = fileDetails.map(file => new FileTicketEntity({
          id: file.id,
          name: file.name,
          mimetype: file.mimetype
        }));
        
        // Activate files (mark them as in use)
        await this.fileProvider.activateFiles(files);
      }
      
      // Create the user entity for the comment
      const userEntity = new UserTicketEntity({
        id: auth.id,
        name: auth.name,
        email: auth.email,
        role: auth.role
      });
      
      // Create the internal comment
      const comment = new CommentEntity({
        user: userEntity,
        content,
        minutes: minutes || 0,
        files: fileEntities,
        internal: true, // Mark as internal comment
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Add the comment to the ticket
      const updatedTicket = await this.ticketRepository.addComment(_id, comment);
      
      if (!updatedTicket) {
        throw new NotFoundException('Ticket not found after update', 'COMMENT_FAILED');
      }
      
      return updatedTicket;
    } catch (error) {
      // Rethrow specific exceptions
      if (
        error instanceof NotFoundException || 
        error instanceof ForbiddenException || 
        error instanceof BadRequestException
      ) {
        throw error;
      }
      
      this.logger.error(`Error adding internal comment: ${error.message}`, error.stack);
      throw error;
    }
  }
}