import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

/**
 * DTO for assigning a ticket to an agent
 */
export class AssignAgentDto {
  @ApiProperty({
    description: 'The ID of the agent to assign',
    example: '60d0fe4f5311236168a109ca',
  })
  @IsNotEmpty({ message: 'Agent ID is required' })
  @IsMongoId({ message: 'Agent ID must be a valid ID' })
  agentId: string;
}