import { Expose, Transform, Type } from 'class-transformer';
import { ContractDto } from './contract.dto';

export class CompanyDto {
  @Expose()
  @Transform(({ value, obj }) => {
    // Intentar obtener _id de varias fuentes posibles
    return (value || obj?._id || obj?.id)?.toString() || undefined;
  })
  _id?: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  @Type(() => ContractDto)
  contracts: ContractDto[];

  @Expose()
  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  createdAt?: string;

  @Expose()
  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  updatedAt?: string;
}