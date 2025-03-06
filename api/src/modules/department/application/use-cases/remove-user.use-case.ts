import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DEPARTMENT_REPOSITORY, DepartmentRepository } from '../../domain/ports/department.repository';

@Injectable()
export class RemoveUserUseCase {
  private readonly logger = new Logger(RemoveUserUseCase.name);

  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: DepartmentRepository
  ) {}

  async execute(departmentId: string, userId: string): Promise<boolean> {
    this.logger.debug(`Removing user ${userId} from department ${departmentId}`);

    // Verificar que existe el departamento
    const department = await this.departmentRepository.findById(departmentId);
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Remover usuario del departamento
    try {
      const result = await this.departmentRepository.removeUser(departmentId, userId);
      
      if (!result) {
        throw new BadRequestException('User is not assigned to this department');
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Error removing user from department: ${error.message}`, error.stack);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to remove user from department');
    }
  }
}