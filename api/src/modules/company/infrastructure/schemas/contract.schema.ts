import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Document } from 'mongoose';

export type ContractDocument = HydratedDocument<Contract>;

@Schema()
export class Contract extends Document {
  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
  })
  hours: number;

  @Prop({
    required: true,
    enum: ['infinite', 'one-time', 'recurring'],
  })
  type: string;

  @Prop({
    required: true,
    default: Date.now,
  })
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop({
    required: true,
    enum: ['active', 'inactive', 'finished'],
  })
  status: string;

  @Prop({
    default: Date.now,
  })
  created_at: Date;
}

export const ContractSchema = SchemaFactory.createForClass(Contract);

ContractSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret._id = ret._id.toString();
    return ret;
  },
});