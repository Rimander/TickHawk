import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now, Document } from 'mongoose';

export type FileSchema = HydratedDocument<File>;

@Schema()
export class File extends Document {
  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
  })
  file: string;

  @Prop({
    required: true,
  })
  path: string;

  @Prop({
    required: true,
  })
  mimetype: string;

  @Prop({
    required: true,
  })
  size: number;

  @Prop({
    required: true,
    enum: ['temporal', 'permanent'],
  })
  status: string;

  @Prop({
    required: false
  })
  createdAt: Date;
}

export const FileSchema = SchemaFactory.createForClass(File);

FileSchema.pre('save', function (next) {
  if (!this.createdAt) {
    this.createdAt = now();
  }
  next();
});