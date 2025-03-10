import { Inject, Injectable, Logger } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '../../domain/ports/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { NotFoundException } from 'src/common/exceptions';

@Injectable()
export class GetUserUseCase {
  private readonly logger = new Logger(GetUserUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  async execute(userId: string): Promise<UserEntity> {
    this.logger.debug(`Getting user with ID: ${userId}`);

    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      this.logger.warn(`User not found with ID: ${userId}`);
      throw new NotFoundException('User not found', 'USER_NOT_FOUND');
    }
    
    return user;
  }
}