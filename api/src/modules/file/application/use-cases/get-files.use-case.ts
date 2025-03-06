import { Inject, Injectable, Logger } from '@nestjs/common';
import { InternalServerException } from 'src/common/exceptions';
import { FileRepository } from '../../domain/ports/file.repository';
import { FileEntity } from '../../domain/entities/file.entity';

@Injectable()
export class GetFilesUseCase {
  private readonly logger = new Logger(GetFilesUseCase.name);
  
  constructor(
    @Inject('FileRepository') private readonly fileRepository: FileRepository,
  ) {}

  async execute(ids: string[]): Promise<FileEntity[]> {
    try {
      this.logger.debug(`Retrieving ${ids.length} files by IDs`);
      
      if (ids.length === 0) {
        this.logger.debug('Empty file IDs array provided, returning empty result');
        return [];
      }
      
      const files = await this.fileRepository.findByIds(ids);
      
      this.logger.debug(`Found ${files.length} of ${ids.length} requested files`);
      
      return files;
    } catch (error) {
      this.logger.error(`Error retrieving files: ${error.message}`, error.stack);
      throw new InternalServerException('Failed to retrieve files', 'FILE_RETRIEVAL_FAILED');
    }
  }
}