import { Inject, Injectable, Logger } from '@nestjs/common';
import { TICKET_REPOSITORY, TicketRepository } from '../../domain/ports/ticket.repository';
import { FILE_PROVIDER, FileProvider } from '../../domain/ports/file.provider';
import { BadRequestException, NotFoundException } from 'src/common/exceptions';

/**
 * Use case for downloading a file attached to a ticket
 */
@Injectable()
export class DownloadTicketFileUseCase {
  private readonly logger = new Logger(DownloadTicketFileUseCase.name);

  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepository,
    @Inject(FILE_PROVIDER)
    private readonly fileProvider: FileProvider
  ) {}

  /**
   * Downloads a file attached to a ticket
   * @param auth The authenticated user information
   * @param fileId The file ID to download
   * @returns The file buffer
   */
  async execute(auth: { id: string; role: string; companyId?: string }, fileId: string): Promise<Buffer> {
    this.logger.debug(`User ${auth.id} requesting file ${fileId}`);
    
    try {
      // Find tickets with this file
      const tickets = await this.ticketRepository.findByFileId(fileId);
      
      if (!tickets || tickets.length === 0) {
        throw new NotFoundException('File not found in any tickets', 'FILE_NOT_FOUND');
      }
      
      // Check if user has access to any of the tickets containing this file
      const hasAccess = tickets.some(ticket => {
        // Customer can access their own tickets
        if (auth.role === 'customer' && ticket.customer.id === auth.id) {
          return true;
        }
        
        // Agent can access tickets assigned to them
        if (auth.role === 'agent' && ticket.agent && ticket.agent.id === auth.id) {
          return true;
        }
        
        // Admin can access all tickets (or tickets from their company if they have one)
        if (auth.role === 'admin') {
          if (!auth.companyId) {
            return true; // Super admin has access to all tickets
          }
          
          return ticket.company.id === auth.companyId;
        }
        
        return false;
      });
      
      if (!hasAccess) {
        throw new BadRequestException('You do not have access to this file', 'FILE_ACCESS_DENIED');
      }
      
      // Verify file exists
      const fileExists = await this.fileProvider.fileExists(fileId);
      
      if (!fileExists) {
        throw new NotFoundException('File not found in storage', 'FILE_NOT_FOUND');
      }
      
      // Get the file
      return await this.fileProvider.getFile(fileId);
    } catch (error) {
      this.logger.error(`Error downloading file: ${error.message}`, error.stack);
      throw error;
    }
  }
}