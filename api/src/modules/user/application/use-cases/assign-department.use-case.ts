import { Inject, Injectable, Logger } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '../../domain/ports/user.repository';
import { NotFoundException } from 'src/common/exceptions';

@Injectable()
export class AssignDepartmentUseCase {
  private readonly logger = new Logger(AssignDepartmentUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    userId: string, 
    departmentId: string
  ): Promise<boolean> {
    this.logger.debug(`Assigning department ${departmentId} to user ${userId}`);

    // First check if user exists
    const userExists = await this.userRepository.findById(userId);
    if (!userExists) {
      this.logger.warn(`User not found with ID: ${userId}`);
      throw new NotFoundException('User not found', 'USER_NOT_FOUND');
    }

    // Assign department to user
    return await this.userRepository.assignDepartment(userId, departmentId);
  }
}