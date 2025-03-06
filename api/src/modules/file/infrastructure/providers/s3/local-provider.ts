import { Injectable } from '@nestjs/common';
import { S3ProviderInterface } from './s3-provider.interface';
import { File } from '../../schemas/file.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalProvider implements S3ProviderInterface {
  private basePath: string;
  
  constructor() {
    this.basePath = process.env.LOCAL_STORAGE_PATH || 'uploads';
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }

  async uploadFile(
    buffer: Buffer, 
    fileName: string, 
    mimetype: string, 
    size: number
  ): Promise<{ path: string; fileIdentifier: string }> {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    const dirPath = path.join(this.basePath, year, month);
    const filePath = path.join(dirPath, fileName);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Write the file
    fs.writeFileSync(filePath, buffer);
    
    return {
      path: `${year}/${month}`,
      fileIdentifier: `${year}/${month}/${fileName}`
    };
  }

  async getFile(file: File): Promise<Buffer> {
    const filePath = path.join(this.basePath, file.file);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    
    return fs.readFileSync(filePath);
  }

  async deleteFile(file: File): Promise<void> {
    const filePath = path.join(this.basePath, file.file);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}