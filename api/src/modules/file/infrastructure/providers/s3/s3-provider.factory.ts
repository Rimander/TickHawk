import { Injectable } from '@nestjs/common';
import { S3ProviderInterface } from './s3-provider.interface';
import { AwsS3Provider } from './aws-s3.provider';
import { MinioS3Provider } from './minio-s3.provider';
import { OvhS3Provider } from './ovh-s3.provider';
import { LocalProvider } from './local-provider';

export type S3ProviderType = 'aws' | 'minio' | 'ovh' | 'local';

@Injectable()
export class S3ProviderFactory {
  private provider: S3ProviderInterface;
  private readonly providerType: S3ProviderType;

  constructor() {
    this.providerType = (
      process.env.STORAGE_TYPE || 'local'
    ).toLowerCase() as S3ProviderType;

    // Create only the instance of the provider we need
    switch (this.providerType) {
      case 'aws':
        this.provider = new AwsS3Provider();
        break;
      case 'minio':
        this.provider = new MinioS3Provider();
        break;
      case 'ovh':
        this.provider = new OvhS3Provider();
        break;
      case 'local':
      default:
        this.provider = new LocalProvider();
        break;
    }
  }

  getProvider(): S3ProviderInterface {
    return this.provider;
  }
}