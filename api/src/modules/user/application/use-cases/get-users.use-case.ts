import { Inject, Injectable, Logger } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '../../domain/ports/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';

@Injectable()
export class GetUsersUseCase {
  private readonly logger = new Logger(GetUsersUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  async execute(options?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    role?: string;
  }): Promise<{ 
    users: UserEntity[]; 
    total: number;
    page: number;
    limit: number;
  }> {
    this.logger.debug(`Getting users with options: ${JSON.stringify(options)}`);
    
    return await this.userRepository.findAll(options);
  }
}