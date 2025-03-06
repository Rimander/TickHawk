import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InternalServerException } from 'src/common/exceptions';
import { FileRepository } from '../../domain/ports/file.repository';
import { FileActivatedEvent } from '../events/file-activated.event';

@Injectable()
export class ActivateFilesUseCase {
  private readonly logger = new Logger(ActivateFilesUseCase.name);
  
  constructor(
    @Inject('FileRepository') private readonly fileRepository: FileRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(ids: string[], session?: any): Promise<void> {
    try {
      this.logger.debug(`Marking ${ids.length} files as active`);
      
      if (ids.length === 0) {
        this.logger.debug('Empty file IDs array provided, skipping update');
        return;
      }
      
      await this.fileRepository.updateMany(ids, 'active', session);
      
      // Emit event
      this.eventEmitter.emit('file.activated', new FileActivatedEvent(ids));
      
      this.logger.debug(`Successfully activated files: ${ids.join(', ')}`);
    } catch (error) {
      this.logger.error(`Error activating files: ${error.message}`, error.stack);
      throw new InternalServerException('Failed to activate files', 'FILE_ACTIVATION_FAILED');
    }
  }
}