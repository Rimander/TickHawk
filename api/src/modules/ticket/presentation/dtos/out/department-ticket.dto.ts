import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DepartmentTicketDto {
  @ApiProperty()
  @Expose()
  _id: string;

  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;
}