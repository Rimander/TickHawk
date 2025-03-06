import { Expose, Type } from 'class-transformer';
import { CompanyDto } from './company.dto';

export class CompaniesDto {
  @Expose()
  @Type(() => CompanyDto)
  companies: CompanyDto[];

  @Expose()
  total: number;

  @Expose()
  page: number;

  @Expose()
  limit: number;
}