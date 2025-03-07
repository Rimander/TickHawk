import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength, ArrayMaxSize } from 'class-validator';

export class ReplyCommentCustomerTicketDto {
  @ApiProperty({ description: 'Ticket ID' })
  @IsMongoId()
  @IsNotEmpty()
  _id: string;

  @ApiProperty({ description: 'Comment content', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  content: string;

  @ApiProperty({ type: [String], description: 'File IDs', maxItems: 3, required: false })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(3)
  files: string[] = [];
}