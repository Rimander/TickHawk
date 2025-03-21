import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { FileTicketDto } from './file-ticket.dto';
import { UserTicketDto } from './user-ticket.dto';

export class CommentDto {
  @ApiProperty()
  @Expose()
  _id: string;

  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty({ type: UserTicketDto })
  @Expose()
  @Type(() => UserTicketDto)
  user: UserTicketDto;

  @ApiProperty()
  @Expose()
  content: string;

  @ApiProperty({ required: false })
  @Expose()
  minutes?: number;

  @ApiProperty({ type: [FileTicketDto] })
  @Expose()
  @Type(() => FileTicketDto)
  files: FileTicketDto[];
  
  @ApiProperty({ required: false })
  @Expose()
  internal?: boolean;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}