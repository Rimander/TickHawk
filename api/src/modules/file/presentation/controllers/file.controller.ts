import {
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Req,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Express } from 'express';
import { FileDto } from '../dtos/out/file.dto';
import { plainToInstance } from 'class-transformer';
import { UploadFileUseCase } from '../../application/use-cases/upload-file.use-case';
import { GetPublicFileUseCase } from '../../application/use-cases/get-public-file.use-case';
import { ActivateFilesUseCase } from '../../application/use-cases/activate-files.use-case';
import { FileEntity } from '../../domain/entities/file.entity';

@Controller('file')
export class FileController {
  private readonly logger = new Logger(FileController.name);
  
  constructor(
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly getPublicFileUseCase: GetPublicFileUseCase,
    private readonly activateFilesUseCase: ActivateFilesUseCase,
  ) {}

  /**
   * Serve a public file from the file system
   * @param file
   * @returns
   */
  @Get('public/:file')
  async servePublicFile(@Param('file') file: string) {
    const buffer = await this.getPublicFileUseCase.execute(file);
    return new StreamableFile(buffer);
  }

  /**
   * Upload a file to the server
   */
  @Post('ticket')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<FileDto> {
    const userId = req.user.id;
    const fileEntity = await this.uploadFileUseCase.execute(file, userId, 'ticket');
    return this.mapToDto(fileEntity);
  }

  /**
   * Upload a file to the server
   */
  @Post('profile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileProfile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<FileDto> {
    const userId = req.user.id;
    const fileEntity = await this.uploadFileUseCase.execute(file, userId, 'profile', userId);
    await this.activateFilesUseCase.execute([fileEntity.id]);
    return this.mapToDto(fileEntity);
  }

  private mapToDto(fileEntity: FileEntity): FileDto {
    return plainToInstance(
      FileDto,
      {
        _id: fileEntity.id,
        name: fileEntity.name,
        file: fileEntity.file,
        mimetype: fileEntity.mimetype,
        size: fileEntity.size,
        status: fileEntity.status,
        createdAt: fileEntity.createdAt,
      },
      { excludeExtraneousValues: true }
    );
  }
}