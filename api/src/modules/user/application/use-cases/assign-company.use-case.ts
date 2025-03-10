import { Inject, Injectable, Logger } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '../../domain/ports/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { NotFoundException } from 'src/common/exceptions';

@Injectable()
export class AssignCompanyUseCase {
  private readonly logger = new Logger(AssignCompanyUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    userId: string, 
    companyId: string | null
  ): Promise<UserEntity> {
    this.logger.debug(`Assigning company ${companyId} to user ${userId}`);

    // First check if user exists
    const userExists = await this.userRepository.findById(userId);
    if (!userExists) {
      this.logger.warn(`User not found with ID: ${userId}`);
      throw new NotFoundException('User not found', 'USER_NOT_FOUND');
    }

    // Assign company to user
    const updatedUser = await this.userRepository.assignCompany(userId, companyId);
    if (!updatedUser) {
      throw new NotFoundException('User not found', 'USER_NOT_FOUND');
    }
    
    return updatedUser;
  }
}