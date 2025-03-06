import { FileEntity } from '../entities/file.entity';
import { StorageResultEntity } from '../entities/storage-result.entity';

export interface StorageProvider {
  uploadFile(
    buffer: Buffer,
    fileName: string,
    mimetype: string,
    size: number
  ): Promise<StorageResultEntity>;
  
  getFile(file: FileEntity): Promise<Buffer>;
  
  deleteFile(file: FileEntity): Promise<void>;
}