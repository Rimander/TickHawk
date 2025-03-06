import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InternalServerException } from 'src/common/exceptions';
import { FileRepository } from '../../domain/ports/file.repository';
import { StorageProvider } from '../../domain/ports/storage.provider';
import { FileDeletedEvent } from '../events/file-deleted.event';

@Injectable()
export class DeleteFileUseCase {
  private readonly logger = new Logger(DeleteFileUseCase.name);
  
  constructor(
    @Inject('FileRepository') private readonly fileRepository: FileRepository,
    @Inject('StorageProvider') private readonly storageProvider: StorageProvider,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string): Promise<boolean> {
    try {
      this.logger.debug(`Removing file with ID: ${id}`);
      
      // Find the file first
      const file = await this.fileRepository.findById(id);
      if (!file) {
        this.logger.warn(`File not found in database for removal: ${id}`);
        return false;
      }
      
      try {
        // Delete from storage provider
        this.logger.debug(`Deleting file from storage provider: ${file.file}`);
        await this.storageProvider.deleteFile(file);
      } catch (error) {
        this.logger.error(`Error deleting file from storage: ${error.message}`, error.stack);
        // Continue with deletion from database even if storage deletion fails
      }
      
      // Delete from database
      const success = await this.fileRepository.delete(id);
      
      if (success) {
        // Emit event
        this.eventEmitter.emit('file.deleted', new FileDeletedEvent(id));
        this.logger.debug(`File with ID: ${id} successfully removed`);
      } else {
        this.logger.warn(`File with ID: ${id} not found for deletion from database`);
      }
      
      return success;
    } catch (error) {
      this.logger.error(`Error removing file ${id}: ${error.message}`, error.stack);
      throw new InternalServerException('Failed to remove file', 'FILE_REMOVAL_FAILED');
    }
  }
}