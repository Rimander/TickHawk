import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserTicketDto } from './user-ticket.dto';

export class EventDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  _id: string;

  @ApiProperty({ type: UserTicketDto })
  @Expose()
  @Type(() => UserTicketDto)
  user: UserTicketDto;

  @ApiProperty({ 
    enum: [
      'close', 
      'open', 
      're-open', 
      'transfer', 
      'status-change', 
      'assign-agent', 
      'create', 
      'comment', 
      'agent-comment'
    ] 
  })
  @Expose()
  type: string;

  @ApiProperty()
  @Expose()
  data: Record<string, any>;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}