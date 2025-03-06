import { Inject, Injectable, Logger } from '@nestjs/common';
import { 
  ForbiddenException,
  InternalServerException,
  NotFoundException 
} from 'src/common/exceptions';
import { FileRepository } from '../../domain/ports/file.repository';
import { StorageProvider } from '../../domain/ports/storage.provider';

@Injectable()
export class GetPublicFileUseCase {
  private readonly logger = new Logger(GetPublicFileUseCase.name);
  
  constructor(
    @Inject('FileRepository') private readonly fileRepository: FileRepository,
    @Inject('StorageProvider') private readonly storageProvider: StorageProvider,
  ) {}

  async execute(id: string): Promise<Buffer> {
    try {
      this.logger.debug(`Retrieving public file with ID: ${id}`);
      
      const file = await this.fileRepository.findById(id);
      if (!file) {
        this.logger.warn(`Public file not found in database: ${id}`);
        throw new NotFoundException('Public file not found', 'FILE_NOT_FOUND');
      }
      
      if (!file.isPublic()) {
        this.logger.warn(`File ${id} is not marked as public`);
        throw new ForbiddenException('File is not public', 'FILE_NOT_PUBLIC');
      }
      
      try {
        this.logger.debug(`Requesting public file from storage provider: ${file.file}`);
        return await this.storageProvider.getFile(file);
      } catch (error) {
        this.logger.error(`Storage provider error: ${error.message}`, error.stack);
        throw new NotFoundException('Public file not found in storage', 'FILE_STORAGE_NOT_FOUND');
      }
    } catch (error) {
      this.logger.error(`Error retrieving public file ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerException('Failed to retrieve public file', 'FILE_RETRIEVAL_FAILED');
    }
  }
}