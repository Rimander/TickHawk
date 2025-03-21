import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber, Min } from 'class-validator';

/**
 * DTO for adding an internal comment to a ticket (only visible to agents/admins)
 */
export class AgentInternalCommentDto {
  @ApiProperty({ description: 'Ticket ID' })
  @IsString()
  @IsNotEmpty()
  _id: string;

  @ApiProperty({ description: 'Comment content' })
  @IsString()
  @IsNotEmpty()
  content: string;
  
  @ApiProperty({ description: 'Time spent in minutes', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minutes?: number;
  
  @ApiProperty({ description: 'File IDs', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  files?: string[];
}