import { FileEntity } from '../../domain/entities/file.entity';

export class FileUploadedEvent {
  constructor(public readonly file: FileEntity) {}
}