import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Document } from 'mongoose';
import { Company } from 'src/modules/company/infrastructure/schemas/company.schema';
import { Department } from 'src/modules/department/schemas/department.schema';

export type UserSchema = HydratedDocument<User>;

@Schema()
export class User extends Document {
  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
  })
  email: string;

  @Prop({
    required: true,
  })
  password: string;

  @Prop({
    required: true,
    default: 'en',
  })
  lang: string;

  @Prop({
    type: String,
    required: true,
    enum: ['admin', 'agent', 'customer'],
    default: 'customer',
  })
  role: string;

  // Customer
  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: Company.name,
  })
  companyId: Types.ObjectId;

  // Agent
  @Prop({
    type: Types.ObjectId,
    ref: Department.name,
    required: false,
  })
  departmentIds: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index by email
UserSchema.index({ email: 1 }, { unique: true });

UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false
});
