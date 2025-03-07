import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsString, MaxLength, ArrayMaxSize } from 'class-validator';

export class CreateCustomerTicketDto {
  @ApiProperty({ description: 'Ticket subject', maxLength: 60 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  subject: string;

  @ApiProperty({ description: 'Ticket content', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  content: string;

  @ApiProperty({ enum: ['low', 'medium', 'high', 'critical'], description: 'Ticket priority' })
  @IsEnum(['low', 'medium', 'high', 'critical'])
  @IsNotEmpty()
  priority: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({ description: 'Department ID' })
  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({ type: [String], description: 'File IDs', maxItems: 3 })
  @IsArray()
  @ArrayMaxSize(3)
  files: string[];
}