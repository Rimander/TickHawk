import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type DepartmentDocument = HydratedDocument<Department>;

@Schema()
export class Department extends Document {
  @Prop({
    required: true,
  })
  name: string;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);

DepartmentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret._id = ret._id.toString();
    return ret;
  },
});