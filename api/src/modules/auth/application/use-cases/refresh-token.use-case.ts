import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AUTH_REPOSITORY, AuthRepository } from '../../domain/ports/auth.repository';

@Injectable()
export class RefreshTokenUseCase {
  private readonly logger = new Logger(RefreshTokenUseCase.name);

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(accessToken: string, refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    this.logger.debug(`Attempting to refresh token: ${accessToken.substring(0, 15)}...`);
    
    // Find the token in the repository
    const token = await this.authRepository.findToken(accessToken, refreshToken);

    if (!token) {
      this.logger.warn('Token not found during refresh attempt');
      throw new UnauthorizedException('INVALID_TOKEN');
    }
    
    if (token.blocked) {
      this.logger.warn(`Blocked token used for refresh: ${token.id}`);
      throw new UnauthorizedException('TOKEN_BLOCKED');
    }
    
    if (token.isExpired()) {
      this.logger.warn(`Expired token used for refresh: ${token.id}, expired at ${token.expiration}`);
      throw new UnauthorizedException('TOKEN_EXPIRED');
    }

    // Verify the refresh token
    this.logger.debug('Verifying refresh token');
    let refreshPayload;
    try {
      refreshPayload = await this.jwtService.verifyAsync(refreshToken);
    } catch (error) {
      this.logger.error(`JWT verification failed: ${error.message}`);
      throw new UnauthorizedException('INVALID_TOKEN');
    }

    if (!refreshPayload) {
      this.logger.warn('Invalid JWT payload during token refresh');
      throw new UnauthorizedException('INVALID_TOKEN');
    }

    // Create a new access token
    this.logger.debug(`Creating new access token for user: ${refreshPayload.sub}`);
    const payload = { 
      sub: refreshPayload.sub, 
      id: refreshPayload.id || refreshPayload.sub,
      // Include any other claims from the original token if available
    };
    const newAccessToken = await this.jwtService.signAsync(payload);

    // Return the new tokens
    this.logger.debug('Token refresh successful');
    return {
      accessToken: newAccessToken,
      refreshToken: refreshToken,  // Keep the same refresh token
    };
  }
}