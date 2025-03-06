import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FileUploadedEvent } from './file-uploaded.event';
import { FileDeletedEvent } from './file-deleted.event';
import { FileActivatedEvent } from './file-activated.event';

@Injectable()
export class FileEventListener {
  private readonly logger = new Logger(FileEventListener.name);

  @OnEvent('file.uploaded')
  handleFileUploadedEvent(event: FileUploadedEvent) {
    this.logger.debug(`File uploaded event: ${event.file.id}`);
    // Additional logic could be added here
  }

  @OnEvent('file.deleted')
  handleFileDeletedEvent(event: FileDeletedEvent) {
    this.logger.debug(`File deleted event: ${event.fileId}`);
    // Additional logic could be added here
  }

  @OnEvent('file.activated')
  handleFileActivatedEvent(event: FileActivatedEvent) {
    this.logger.debug(`Files activated event: ${event.fileIds.join(', ')}`);
    // Additional logic could be added here
  }
}