import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { USER_REPOSITORY, UserRepository } from 'src/modules/user/domain/ports/user.repository';
import { AUTH_REPOSITORY, AuthRepository } from '../../domain/ports/auth.repository';
import { TokenEntity } from '../../domain/entities/token.entity';
import { toMs } from 'ms-typescript';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SignInUseCase {
  private readonly logger = new Logger(SignInUseCase.name);

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
    this.logger.debug(`Sign in attempt for email: ${email}`);
    
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      this.logger.warn(`User not found for email: ${email}`);
      throw new UnauthorizedException('EMAIL_PASSWORD_NOT_MATCH');
    }
    
    this.logger.debug('Verifying password');
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      this.logger.warn(`Password mismatch for user: ${email}`);
      throw new UnauthorizedException('EMAIL_PASSWORD_NOT_MATCH');
    }

    // Create a JWT refresh token
    this.logger.debug(`Creating JWT tokens for user: ${user._id}`);
    const refreshToken = await this.jwtService.signAsync(
      { sub: user._id, id: user._id },
      { expiresIn: '1d' },
    );

    const payload = {
      sub: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentIds: user.departmentIds,
      companyId: user.companyId,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    const refreshTokenExpiration = this.configService.get<string>(
      'jwt.refreshTokenExpiration',
      '1d'
    );

    // Create token entity
    const token = new TokenEntity({
      userId: user._id.toString(),
      accessToken: accessToken,
      refreshToken: refreshToken,
      blocked: false,
      expiration: new Date(Date.now() + toMs(refreshTokenExpiration))
    });

    // Save the refresh token to the repository
    this.logger.debug('Saving token to database');
    await this.authRepository.createToken(token);
    
    this.logger.debug(`User ${user._id} successfully signed in`);
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}