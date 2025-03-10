import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { USER_REPOSITORY, UserRepository } from '../../domain/ports/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { NotFoundException } from 'src/common/exceptions';
import * as bcrypt from 'bcryptjs';
import { UserUpdatedEvent } from '../events/user-updated.event';

@Injectable()
export class UpdateUserUseCase {
  private readonly logger = new Logger(UpdateUserUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(
    userId: string, 
    userData: {
      name?: string;
      email?: string;
      password?: string;
      lang?: string;
      role?: string;
    }
  ): Promise<UserEntity> {
    this.logger.debug(`Updating user with ID: ${userId}`);

    // Get current user to detect changes
    const currentUser = await this.userRepository.findById(userId);
    if (!currentUser) {
      this.logger.warn(`User not found with ID: ${userId}`);
      throw new NotFoundException('User not found', 'USER_NOT_FOUND');
    }

    // Hash password if provided
    if (userData.password) {
      userData.password = bcrypt.hashSync(userData.password, 10);
    }

    // Update user
    const updatedUser = await this.userRepository.update(userId, userData);
    if (!updatedUser) {
      throw new NotFoundException('User not found', 'USER_NOT_FOUND');
    }

    // Determine what fields have changed for the event
    const updates = {
      name: userData.name !== currentUser.name ? userData.name : undefined,
      email: userData.email !== currentUser.email ? userData.email : undefined,
      role: userData.role !== currentUser.role ? userData.role : undefined
    };

    // If user data relevant to tickets has changed, emit an event
    if (updates.name || updates.email || updates.role) {
      this.logger.debug(`Emitting user update event for user ${userId}`);
      this.eventEmitter.emit(
        'user.updated', 
        new UserUpdatedEvent(userId, updates)
      );
    }
    
    return updatedUser;
  }
}