import { File } from '../../schemas/file.schema';

export interface S3ProviderInterface {
  uploadFile(
    buffer: Buffer, 
    fileName: string, 
    mimetype: string, 
    size: number
  ): Promise<{
    path: string; 
    fileIdentifier: string;
  }>;
  
  getFile(file: File): Promise<Buffer>;
  
  deleteFile(file: File): Promise<void>;
}