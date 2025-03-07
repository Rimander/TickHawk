import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserTicketDto {
  @ApiProperty()
  @Expose()
  _id: string;

  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty({ enum: ['admin', 'agent', 'customer'] })
  @Expose()
  role: string;
}