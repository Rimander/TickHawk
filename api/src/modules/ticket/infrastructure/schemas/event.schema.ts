import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, now, Document} from 'mongoose';
import { UserTicket, UserTicketSchema } from './user-ticket.schema';

export type EventSchema = HydratedDocument<Event>;

@Schema()
export class Event extends Document {
  @Prop({
    type: UserTicketSchema,
    required: true,
  })
  user: UserTicket;

  @Prop({
    required: true,
    enum: ['close', 'open', 're-open', 'transfer', 'status-change', 'assign-agent'],
  })
  type: string;
  
  @Prop({
    required: false,
    type: Object,
  })
  data: Record<string, any>;

  @Prop({})
  createdAt: Date;

  @Prop({})
  updatedAt: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_, ret) {
   ret._id = ret._id.toString();
  }
});

EventSchema.pre('save', function (next) {
  this.updatedAt = now();
  // Its new ticket
  if (!this.createdAt) {
    this.createdAt = this.updatedAt;
  }
  next();
});

