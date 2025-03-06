import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { Express } from 'express';
import { InternalServerException } from 'src/common/exceptions';
import { FileRepository } from '../../domain/ports/file.repository';
import { FileEntity } from '../../domain/entities/file.entity';
import { StorageProvider } from '../../domain/ports/storage.provider';
import { FileUploadedEvent } from '../events/file-uploaded.event';

@Injectable()
export class UploadFileUseCase {
  private readonly logger = new Logger(UploadFileUseCase.name);

  constructor(
    @Inject('FileRepository') private readonly fileRepository: FileRepository,
    @Inject('StorageProvider') private readonly storageProvider: StorageProvider,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    file: Express.Multer.File,
    userId: string,
    path: string = null,
    id: string = null,
  ): Promise<FileEntity> {
    try {
      this.logger.debug(`Saving file for user ${userId}, original name: ${file.originalname}`);
      
      const objectId = id ? id : new Types.ObjectId().toString();

      // Check size < 5MB
      if (file.size > 5 * 1024 * 1024) {
        this.logger.warn(`File size too large: ${file.size} bytes`);
        throw new BadRequestException('File size too large (max 5MB)', 'FILE_SIZE_TOO_LARGE');
      }

      // Check if the name is too long and shorten it if necessary
      let fileName = file.originalname;
      if (fileName.length > 25) {
        this.logger.debug(`Shortening long filename from ${fileName.length} chars`);
        fileName =
          fileName.substring(0, 25) +
          file.originalname.substring(file.originalname.lastIndexOf('.'));
      }

      // Upload the file to the storage provider
      this.logger.debug(`Uploading file to storage provider: ${objectId}-${fileName}`);
      const uploadResult = await this.storageProvider.uploadFile(
        file.buffer,
        `${objectId}-${fileName}`,
        file.mimetype,
        file.size
      );

      // Check if the file is already in the database
      const existingFile = await this.fileRepository.findById(objectId);
      if (existingFile) {
        this.logger.debug(`File with ID ${objectId} already exists, checking storage`);
        try {
          // Try to get the old file to verify it exists
          await this.storageProvider.getFile(existingFile);
          // If exists, we could delete it here if desired
        } catch (error) {
          this.logger.warn(`Previous file not found in storage: ${error.message}`);
          // Old file not found, continue with the new one
        }
      }

      // Create file entity
      const fileEntity = FileEntity.create({
        id: objectId,
        name: fileName,
        file: uploadResult.fileIdentifier,
        path: uploadResult.path,
        mimetype: file.mimetype,
        size: file.size,
        status: 'temporal',
        userId,
      });

      // Save file metadata in database
      this.logger.debug(`Storing file metadata in database: ${objectId}`);
      const savedFile = await this.fileRepository.upsert(fileEntity);

      // Emit event
      this.eventEmitter.emit('file.uploaded', new FileUploadedEvent(savedFile));

      this.logger.debug(`File saved successfully with ID: ${savedFile.id}`);
      return savedFile;
    } catch (error) {
      this.logger.error(`Error saving file: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerException('Failed to save file', 'FILE_SAVE_FAILED');
    }
  }
}