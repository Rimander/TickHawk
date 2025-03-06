import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { File, FileSchema } from './infrastructure/schemas/file.schema';
import { S3ProviderFactory } from './infrastructure/providers/s3/s3-provider.factory';
import { FileController } from './presentation/controllers/file.controller';
import { MongoFileRepository } from './infrastructure/repositories/mongo-file.repository';
import { FileRepository } from './domain/ports/file.repository';
import { StorageProvider } from './domain/ports/storage.provider';
import { StorageProviderAdapter } from './infrastructure/providers/storage-provider.adapter';
import { UploadFileUseCase } from './application/use-cases/upload-file.use-case';
import { GetFileUseCase } from './application/use-cases/get-file.use-case';
import { GetPublicFileUseCase } from './application/use-cases/get-public-file.use-case';
import { GetFilesUseCase } from './application/use-cases/get-files.use-case';
import { ActivateFilesUseCase } from './application/use-cases/activate-files.use-case';
import { DeleteFileUseCase } from './application/use-cases/delete-file.use-case';
import { FileExistsUseCase } from './application/use-cases/file-exists.use-case';
import { FileEventListener } from './application/events/file-event.listener';

@Global()
@Module({
  controllers: [FileController],
  providers: [
    // Event listeners
    FileEventListener,
    
    // Repositories
    {
      provide: 'FileRepository',
      useClass: MongoFileRepository,
    },
    
    // Storage provider
    S3ProviderFactory,
    {
      provide: 'StorageProvider',
      useClass: StorageProviderAdapter,
    },
    
    // Use cases
    UploadFileUseCase,
    GetFileUseCase,
    GetPublicFileUseCase,
    GetFilesUseCase,
    ActivateFilesUseCase,
    DeleteFileUseCase,
    FileExistsUseCase,
  ],
  imports: [
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  exports: [
    // Export use cases for other modules to use
    UploadFileUseCase,
    GetFileUseCase,
    GetPublicFileUseCase,
    GetFilesUseCase,
    ActivateFilesUseCase,
    DeleteFileUseCase,
    FileExistsUseCase,
  ],
})
export class FileModule {}
