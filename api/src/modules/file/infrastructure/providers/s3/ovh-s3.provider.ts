import { Injectable } from '@nestjs/common';
import { S3ProviderInterface } from './s3-provider.interface';
import { File } from '../../schemas/file.schema';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class OvhS3Provider implements S3ProviderInterface {
  private s3Client: S3Client;
  private bucketName: string;
  
  constructor() {
    this.bucketName = process.env.OVH_S3_BUCKET_NAME;
    this.s3Client = new S3Client({
      region: process.env.OVH_S3_REGION,
      endpoint: process.env.OVH_S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.OVH_S3_ACCESS_KEY,
        secretAccessKey: process.env.OVH_S3_SECRET_KEY,
      }
    });
  }

  async uploadFile(
    buffer: Buffer, 
    fileName: string, 
    mimetype: string, 
    size: number
  ): Promise<{ path: string; fileIdentifier: string }> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const path = `${year}/${month}`;
    const fileId = `${path}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileId,
      Body: buffer,
      ContentType: mimetype,
    });

    await this.s3Client.send(command);
    
    return {
      path: path,
      fileIdentifier: fileId
    };
  }

  async getFile(file: File): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: file.file,
    });

    const response = await this.s3Client.send(command);
    
    if (!response.Body) {
      throw new Error('File content is empty');
    }
    
    return Buffer.from(await response.Body.transformToByteArray());
  }

  async deleteFile(file: File): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: file.file,
    });

    await this.s3Client.send(command);
  }
}