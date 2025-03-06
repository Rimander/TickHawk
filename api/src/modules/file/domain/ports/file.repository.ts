import { FileEntity } from '../entities/file.entity';

export interface FileRepository {
  findById(id: string): Promise<FileEntity | null>;
  findByIds(ids: string[]): Promise<FileEntity[]>;
  save(file: FileEntity): Promise<FileEntity>;
  upsert(file: FileEntity): Promise<FileEntity>;
  updateMany(ids: string[], status: string, session?: any): Promise<void>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}