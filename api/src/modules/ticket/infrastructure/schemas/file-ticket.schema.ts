import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Document } from 'mongoose';

export type FileTicketSchema = HydratedDocument<FileTicket>;

@Schema()
export class FileTicket extends Document {
  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
  })
  mimetype: string;
}

export const FileTicketSchema = SchemaFactory.createForClass(FileTicket);

FileTicketSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_, ret) {
   ret._id = ret._id.toString();
  }
});
