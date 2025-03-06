import { Inject, Injectable, Logger } from '@nestjs/common';
import { 
  InternalServerException,
  NotFoundException 
} from 'src/common/exceptions';
import { FileRepository } from '../../domain/ports/file.repository';
import { StorageProvider } from '../../domain/ports/storage.provider';

@Injectable()
export class GetFileUseCase {
  private readonly logger = new Logger(GetFileUseCase.name);
  
  constructor(
    @Inject('FileRepository') private readonly fileRepository: FileRepository,
    @Inject('StorageProvider') private readonly storageProvider: StorageProvider,
  ) {}

  async execute(id: string): Promise<Buffer> {
    try {
      this.logger.debug(`Retrieving file with ID: ${id}`);
      
      const file = await this.fileRepository.findById(id);
      if (!file) {
        this.logger.warn(`File not found in database: ${id}`);
        throw new NotFoundException('File not found', 'FILE_NOT_FOUND');
      }

      try {
        this.logger.debug(`Requesting file from storage provider: ${file.file}`);
        return await this.storageProvider.getFile(file);
      } catch (error) {
        this.logger.error(`Storage provider error: ${error.message}`, error.stack);
        throw new NotFoundException('File not found in storage', 'FILE_STORAGE_NOT_FOUND');
      }
    } catch (error) {
      this.logger.error(`Error retrieving file ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerException('Failed to retrieve file', 'FILE_RETRIEVAL_FAILED');
    }
  }
}