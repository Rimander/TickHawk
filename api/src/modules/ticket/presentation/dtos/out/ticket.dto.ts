import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CommentDto } from './comment.dto';
import { CompanyTicketDto } from './company-ticket.dto';
import { DepartmentTicketDto } from './department-ticket.dto';
import { EventDto } from './event.dto';
import { FileTicketDto } from './file-ticket.dto';
import { UserTicketDto } from './user-ticket.dto';

export class TicketDto {
  @ApiProperty()
  @Expose()
  _id: string;

  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty({ enum: ['open', 'closed', 'in-progress', 'pending', 'resolved'] })
  @Expose()
  status: string;

  @ApiProperty({ enum: ['low', 'medium', 'high', 'critical'] })
  @Expose()
  priority: string;

  @ApiProperty({ type: CompanyTicketDto })
  @Expose()
  @Type(() => CompanyTicketDto)
  company: CompanyTicketDto;

  @ApiProperty({ type: UserTicketDto })
  @Expose()
  @Type(() => UserTicketDto)
  customer: UserTicketDto;

  @ApiProperty({ type: UserTicketDto, required: false })
  @Expose()
  @Type(() => UserTicketDto)
  agent?: UserTicketDto;

  @ApiProperty()
  @Expose()
  subject: string;

  @ApiProperty()
  @Expose()
  content: string;

  @ApiProperty({ type: UserTicketDto })
  @Expose()
  @Type(() => UserTicketDto)
  content_user: UserTicketDto;

  @ApiProperty()
  @Expose()
  minutes: number;

  @ApiProperty({ type: [FileTicketDto] })
  @Expose()
  @Type(() => FileTicketDto)
  files: FileTicketDto[];

  @ApiProperty({ type: [CommentDto] })
  @Expose()
  @Type(() => CommentDto)
  comments: CommentDto[];

  @ApiProperty({ type: [EventDto] })
  @Expose()
  @Type(() => EventDto)
  events: EventDto[];

  @ApiProperty({ type: DepartmentTicketDto })
  @Expose()
  @Type(() => DepartmentTicketDto)
  department: DepartmentTicketDto;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}