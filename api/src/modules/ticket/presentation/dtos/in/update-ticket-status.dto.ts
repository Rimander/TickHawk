import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

/**
 * DTO for updating a ticket's status
 */
export class UpdateTicketStatusDto {
  @ApiProperty({
    description: 'The new status for the ticket',
    enum: ['open', 'closed', 'in-progress', 'pending', 'resolved'],
    example: 'in-progress',
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(['open', 'closed', 'in-progress', 'pending', 'resolved'], {
    message: 'Status must be one of: open, closed, in-progress, pending, resolved',
  })
  status: string;
}