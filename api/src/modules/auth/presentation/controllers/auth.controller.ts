import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Public } from 'src/config/public.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { SignInDto } from '../dtos/in/sign-in.dto';
import { ForgotPasswordDto } from '../dtos/in/forgot-password.dto';
import { RefreshTokenDto } from '../dtos/in/refresh-token.dto';
import { SignInTokenDto } from '../dtos/out/sign-in-token.dto';

import { SignInUseCase } from '../../application/use-cases/sign-in.use-case';
import { SignOutUseCase } from '../../application/use-cases/sign-out.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password.use-case';

@Controller('auth')
@Public()
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private readonly signInUseCase: SignInUseCase,
    private readonly signOutUseCase: SignOutUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase
  ) {}

  /**
   * Sign in a user
   * @param signIn - The sign in object
   * @returns The sign in token
   * @throws UnauthorizedException
   */
  @Post('/sign-in')
  @ApiOperation({ summary: 'Sign in a user' })
  @ApiResponse({ status: 200, type: SignInTokenDto })
  async signInCustomer(@Body() signIn: SignInDto): Promise<SignInTokenDto> {
    const result = await this.signInUseCase.execute(signIn.email, signIn.password);
    return plainToInstance(SignInTokenDto, result, { excludeExtraneousValues: true });
  }

  /**
   * Sign out a user by invalidating the token
   * @param request - The request object
   * @returns HttpStatus.OK
   */
  @Get('/sign-out')
  @ApiOperation({ summary: 'Sign out a user by invalidating the token' })
  @ApiResponse({ status: 200 })
  async signOutCustomer(@Req() request: Request) {
    if (!request.headers.authorization) {
      throw new UnauthorizedException('INVALID_TOKEN');
    }
    const token = request.headers.authorization.split(' ')[1];

    if (
      !token ||
      token === 'null' ||
      token === 'undefined' ||
      token.length <= 10
    ) {
      throw new UnauthorizedException('INVALID_TOKEN');
    }

    await this.signOutUseCase.execute(token);

    return HttpStatus.OK;
  }

  /**
   * Forgot password endpoint to send an email to the user
   * @param forgotPasswordDto - The email of the user
   * @returns HttpStatus.OK
   */
  @Post('/forgot-password')
  @ApiOperation({ summary: 'Forgot password endpoint to send an email to the user' })
  @ApiResponse({ status: 202 })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.forgotPasswordUseCase.execute(forgotPasswordDto.email);
    return HttpStatus.ACCEPTED;
  }

  /**
   * Refresh token endpoint to get a new access token
   * @param refreshTokenDto 
   * @returns New token pair
   */
  @Post('/refresh-token')
  @ApiOperation({ summary: 'Refresh token endpoint to get a new access token' })
  @ApiResponse({ status: 200, type: SignInTokenDto })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto, @Req() request: Request): Promise<SignInTokenDto> {
    if (!request.headers.authorization || !request.headers.authorization.split(' ')[1]) {
      throw new UnauthorizedException('INVALID_TOKEN');
    }
    const accessToken = request.headers.authorization.split(' ')[1];
    
    const result = await this.refreshTokenUseCase.execute(accessToken, refreshTokenDto.refreshToken);
    return plainToInstance(SignInTokenDto, result, { excludeExtraneousValues: true });
  }
}