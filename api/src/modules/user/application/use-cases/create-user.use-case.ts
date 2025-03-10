import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { USER_REPOSITORY, UserRepository } from '../../domain/ports/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { BadRequestException, ConflictException } from 'src/common/exceptions';

@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  async execute(userData: {
    name: string;
    email: string;
    password: string;
    lang?: string;
    role?: string;
  }): Promise<UserEntity> {
    this.logger.debug(`Creating user with email: ${userData.email}`);

    if (!userData.password) {
      throw new BadRequestException('Password is required', 'PASSWORD_REQUIRED');
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(userData.password, 10);

    // Create user entity
    const user = new UserEntity({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      lang: userData.lang || 'en',
      role: userData.role || 'customer'
    });

    try {
      // Save user in repository
      return await this.userRepository.create(user);
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      
      // Re-throw conflict exception
      if (error instanceof ConflictException) {
        throw error;
      }
      
      throw error;
    }
  }
}