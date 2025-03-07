import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Document} from 'mongoose';

export type DepartmentTicketSchema = HydratedDocument<DepartmentTicket>;

@Schema()
export class DepartmentTicket extends Document {
  @Prop({
    required: true,
  })
  name: string;
}

export const DepartmentTicketSchema = SchemaFactory.createForClass(DepartmentTicket);

DepartmentTicketSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_, ret) {
   ret._id = ret._id.toString();
  }
});
