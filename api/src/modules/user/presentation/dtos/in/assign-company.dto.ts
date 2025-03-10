import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class AssignCompanyDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  companyId?: Types.ObjectId;
}