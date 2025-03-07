import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Document} from 'mongoose';

export type UserTicketSchema = HydratedDocument<UserTicket>;

@Schema()
export class UserTicket extends Document {
  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
    enum: ['admin', 'agent', 'customer'],
    default: 'customer',
  })
  role: string;
}

export const UserTicketSchema = SchemaFactory.createForClass(UserTicket);

UserTicketSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_, ret) {
   ret._id = ret._id.toString();
  }
});
