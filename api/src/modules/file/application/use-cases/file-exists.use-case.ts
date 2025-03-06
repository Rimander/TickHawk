import { Inject, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { FileRepository } from '../../domain/ports/file.repository';
import { StorageProvider } from '../../domain/ports/storage.provider';

@Injectable()
export class FileExistsUseCase {
  private readonly logger = new Logger(FileExistsUseCase.name);
  
  constructor(
    @Inject('FileRepository') private readonly fileRepository: FileRepository,
    @Inject('StorageProvider') private readonly storageProvider: StorageProvider,
  ) {}

  async execute(id: string): Promise<boolean> {
    try {
      if (!id) {
        this.logger.debug('Null or undefined file ID passed to fileExists');
        return false;
      }
      
      this.logger.debug(`Checking if file exists with ID: ${id}`);
      
      // Check if the ID is a valid ObjectId
      if (!Types.ObjectId.isValid(id)) {
        this.logger.debug(`Invalid ObjectId format: ${id}`);
        return false;
      }
      
      // Check if the file exists in the database
      const exists = await this.fileRepository.exists(id);
      this.logger.debug(`File existence check for ${id} in database: ${exists}`);
      
      // If file exists in database, optionally check storage too
      if (exists) {
        // Get the file to check its storage
        const file = await this.fileRepository.findById(id);
        
        if (file) {
          try {
            await this.storageProvider.getFile(file);
            this.logger.debug(`File ${id} exists in both database and storage`);
            return true;
          } catch (storageError) {
            this.logger.warn(`File ${id} exists in database but not in storage: ${storageError.message}`);
            // Return true even if file doesn't exist in storage but exists in DB
            return true;
          }
        }
      }
      
      return exists;
    } catch (error) {
      this.logger.error(`Error checking if file exists: ${error.message}`, error.stack);
      return false; // Return false instead of throwing an exception for better error handling
    }
  }
}