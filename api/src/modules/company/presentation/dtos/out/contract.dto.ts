import { Expose, Transform } from 'class-transformer';

export class ContractDto {
  @Expose()
  @Transform(({ value }) => value?.toString() || value)
  _id?: string;

  @Expose()
  name: string;

  @Expose()
  hours: number;

  @Expose()
  type: string;

  @Expose()
  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  startDate: string;

  @Expose()
  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  endDate?: string;

  @Expose()
  status: string;

  @Expose()
  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  created_at?: string;
}