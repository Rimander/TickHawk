import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FileEntity, FileStatus } from '../../domain/entities/file.entity';
import { FileRepository } from '../../domain/ports/file.repository';
import { File } from '../schemas/file.schema';

@Injectable()
export class MongoFileRepository implements FileRepository {
  private readonly logger = new Logger(MongoFileRepository.name);

  constructor(
    @InjectModel(File.name) private readonly fileModel: Model<File>,
  ) {}

  async findById(id: string): Promise<FileEntity | null> {
    const file = await this.fileModel.findById(id);
    return file ? this.mapToEntity(file) : null;
  }

  async findByIds(ids: string[]): Promise<FileEntity[]> {
    const files = await this.fileModel.find({
      _id: { $in: ids },
    });
    return files.map(file => this.mapToEntity(file));
  }

  async save(file: FileEntity): Promise<FileEntity> {
    const fileDoc = new this.fileModel({
      _id: file.id,
      name: file.name,
      file: file.file,
      userId: file.userId,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
      status: file.status,
      createdAt: file.createdAt,
    });
    
    const savedFile = await fileDoc.save();
    return this.mapToEntity(savedFile);
  }

  async upsert(file: FileEntity): Promise<FileEntity> {
    const fileDoc = await this.fileModel.findOneAndUpdate(
      { _id: file.id },
      {
        _id: file.id,
        name: file.name,
        file: file.file,
        userId: file.userId,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        status: file.status,
        createdAt: file.createdAt,
      },
      {
        new: true,
        upsert: true,
      },
    );
    
    return this.mapToEntity(fileDoc);
  }

  async updateMany(ids: string[], status: string, session?: any): Promise<void> {
    const sessionOption = session ? { session } : {};
    const result = await this.fileModel.updateMany(
      { _id: { $in: ids } },
      { status },
      sessionOption
    );
    
    this.logger.debug(`Updated ${result.modifiedCount} files with status: ${status}`);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.fileModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async exists(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    
    const count = await this.fileModel.countDocuments({ _id: id });
    return count > 0;
  }

  private mapToEntity(document: File): FileEntity {
    const json = document.toJSON();
    return FileEntity.create({
      id: json._id,
      name: json.name,
      file: json.file,
      userId: json.userId,
      path: json.path,
      mimetype: json.mimetype,
      size: json.size,
      status: json.status as FileStatus,
      createdAt: json.createdAt,
    });
  }
}