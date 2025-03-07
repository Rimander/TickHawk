import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Document} from 'mongoose';

export type CompanyTicketSchema = HydratedDocument<CompanyTicket>;

@Schema()
export class CompanyTicket extends Document {
  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
  })
  email: string;
}

export const CompanyTicketSchema = SchemaFactory.createForClass(CompanyTicket);

CompanyTicketSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_, ret) {
   ret._id = ret._id.toString();
  }
});
