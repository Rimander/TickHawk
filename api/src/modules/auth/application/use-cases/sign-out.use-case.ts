import { Inject, Injectable, Logger } from '@nestjs/common';
import { AUTH_REPOSITORY, AuthRepository } from '../../domain/ports/auth.repository';

@Injectable()
export class SignOutUseCase {
  private readonly logger = new Logger(SignOutUseCase.name);

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository
  ) {}

  async execute(accessToken: string): Promise<void> {
    this.logger.debug(`Signing out user with token: ${accessToken.substring(0, 15)}...`);
    
    // Delete the token
    const result = await this.authRepository.deleteToken(accessToken);
    
    this.logger.debug(`Token deletion result: ${result}`);
  }
}