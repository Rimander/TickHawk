import { Injectable } from '@nestjs/common';
import { GetFileUseCase } from '../../../file/application/use-cases/get-file.use-case';
import { GetFilesUseCase } from '../../../file/application/use-cases/get-files.use-case';
import { ActivateFilesUseCase } from '../../../file/application/use-cases/activate-files.use-case';
import { FileExistsUseCase } from '../../../file/application/use-cases/file-exists.use-case';
import { FileProvider } from '../../domain/ports/file.provider';

/**
 * Adapter for file use cases
 */
@Injectable()
export class FileAdapter implements FileProvider {
  constructor(
    private readonly getFileUseCase: GetFileUseCase,
    private readonly getFilesUseCase: GetFilesUseCase,
    private readonly activateFilesUseCase: ActivateFilesUseCase,
    private readonly fileExistsUseCase: FileExistsUseCase
  ) {}

  /**
   * Gets file information
   * @param fileId The file ID
   */
  async getFile(fileId: string): Promise<Buffer> {
    return this.getFileUseCase.execute(fileId);
  }

  /**
   * Gets multiple files information
   * @param fileIds The file IDs
   */
  async getFiles(fileIds: string[]): Promise<{ id: string, name: string, mimetype: string }[]> {
    if (!fileIds || fileIds.length === 0) {
      return [];
    }
    
    const files = await this.getFilesUseCase.execute(fileIds);
    return files.map(file => ({
      id: file.id,
      name: file.name,
      mimetype: file.mimetype
    }));
  }

  /**
   * Activates files (marks them as in use)
   * @param fileIds The file IDs to activate
   */
  async activateFiles(fileIds: string[]): Promise<void> {
    if (fileIds && fileIds.length > 0) {
      await this.activateFilesUseCase.execute(fileIds);
    }
  }

  /**
   * Checks if a file exists and is accessible
   * @param fileId The file ID
   */
  async fileExists(fileId: string): Promise<boolean> {
    return this.fileExistsUseCase.execute(fileId);
  }
}