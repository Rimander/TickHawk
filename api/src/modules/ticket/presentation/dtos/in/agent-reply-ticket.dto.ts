import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

/**
 * DTO for agent replying to a ticket
 */
export class AgentReplyTicketDto {
  @ApiProperty({
    description: 'The ID of the ticket',
    example: '60d0fe4f5311236168a109ca',
  })
  @IsNotEmpty({ message: 'Ticket ID is required' })
  @IsMongoId({ message: 'Ticket ID must be a valid ID' })
  _id: string;

  @ApiProperty({
    description: 'The content of the reply',
    example: 'We are working on this issue. Please provide more details.',
  })
  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  content: string;

  @ApiProperty({
    description: 'minutes spent on this ticket (for tracking time)',
    example: 0.5,
    required: false,
  })
  @IsOptional()
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'minutes must be a valid number' },
  )
  @Min(0, { message: 'minutes must be a positive number' })
  minutes?: number;

  @ApiProperty({
    description: 'IDs of files attached to this reply',
    type: [String],
    required: false,
    example: ['60d0fe4f5311236168a109ca', '60d0fe4f5311236168a109cb'],
  })
  @IsOptional()
  @IsArray({ message: 'Files must be an array' })
  @IsMongoId({ each: true, message: 'Each file ID must be a valid ID' })
  files?: string[];
}