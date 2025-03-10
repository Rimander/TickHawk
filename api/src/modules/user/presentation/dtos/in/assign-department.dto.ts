import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AssignDepartmentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  departmentId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  userId: string;
}
