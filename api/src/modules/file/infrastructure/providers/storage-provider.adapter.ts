import { Injectable } from '@nestjs/common';
import { StorageProvider } from '../../domain/ports/storage.provider';
import { FileEntity } from '../../domain/entities/file.entity';
import { StorageResultEntity } from '../../domain/entities/storage-result.entity';
import { S3ProviderFactory } from './s3/s3-provider.factory';

@Injectable()
export class StorageProviderAdapter implements StorageProvider {
  constructor(private readonly s3ProviderFactory: S3ProviderFactory) {}

  async uploadFile(
    buffer: Buffer,
    fileName: string,
    mimetype: string,
    size: number
  ): Promise<StorageResultEntity> {
    const result = await this.s3ProviderFactory.getProvider().uploadFile(
      buffer,
      fileName,
      mimetype,
      size
    );
    
    return StorageResultEntity.create({
      path: result.path,
      fileIdentifier: result.fileIdentifier,
    });
  }

  async getFile(file: FileEntity): Promise<Buffer> {
    // Convert from FileEntity to the schema File required by the S3 provider
    const fileForProvider = {
      file: file.file,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
    };
    
    return this.s3ProviderFactory.getProvider().getFile(fileForProvider as any);
  }

  async deleteFile(file: FileEntity): Promise<void> {
    // Convert from FileEntity to the schema File required by the S3 provider
    const fileForProvider = {
      file: file.file,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
    };
    
    await this.s3ProviderFactory.getProvider().deleteFile(fileForProvider as any);
  }
}