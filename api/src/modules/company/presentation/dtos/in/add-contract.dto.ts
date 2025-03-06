import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  IsEnum, 
  IsDate, 
  IsOptional,
  MaxLength,
  Min
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddContractDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MaxLength(100, { message: 'Name must be at most 100 characters' })
  name: string;

  @IsNotEmpty({ message: 'Hours is required' })
  @IsNumber({}, { message: 'Hours must be a number' })
  @Min(0, { message: 'Hours must be at least 0' })
  hours: number;

  @IsNotEmpty({ message: 'Type is required' })
  @IsEnum(['infinite', 'one-time', 'recurring'], { 
    message: 'Type must be one of: infinite, one-time, recurring' 
  })
  type: 'infinite' | 'one-time' | 'recurring';

  @IsNotEmpty({ message: 'Start date is required' })
  @Type(() => Date)
  @IsDate({ message: 'Start date must be a valid date' })
  startDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'End date must be a valid date' })
  endDate?: Date;

  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(['active', 'inactive', 'finished'], { 
    message: 'Status must be one of: active, inactive, finished' 
  })
  status: 'active' | 'inactive' | 'finished';
}