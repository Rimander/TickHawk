import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DEPARTMENT_REPOSITORY, DepartmentRepository } from '../../domain/ports/department.repository';

@Injectable()
export class AssignUserUseCase {
  private readonly logger = new Logger(AssignUserUseCase.name);

  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: DepartmentRepository
  ) {}

  async execute(departmentId: string, userId: string): Promise<boolean> {
    this.logger.debug(`Assigning user ${userId} to department ${departmentId}`);

    // Verificar que existe el departamento
    const department = await this.departmentRepository.findById(departmentId);
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Asignar usuario al departamento
    try {
      const result = await this.departmentRepository.assignUser(departmentId, userId);
      
      if (!result) {
        throw new BadRequestException('User already assigned to this department');
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Error assigning user to department: ${error.message}`, error.stack);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to assign user to department');
    }
  }
}