import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty()
  @IsEmail({}, { message: 'EMAIL_INVALID' })
  @IsNotEmpty({ message: 'EMAIL_REQUIRED' })
  email: string;

  @ApiProperty()
  @IsString({ message: 'PASSWORD_INVALID' })
  @IsNotEmpty({ message: 'PASSWORD_REQUIRED' })
  @MinLength(6, { message: 'PASSWORD_MIN_LENGTH' })
  password: string;
}