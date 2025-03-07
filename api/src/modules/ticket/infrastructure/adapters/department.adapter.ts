import { Injectable } from '@nestjs/common';
import { GetDepartmentUseCase } from '../../../department/application/use-cases/get-department.use-case';
import { DepartmentProvider } from '../../domain/ports/department.provider';
import { DepartmentTicketEntity } from '../../domain/entities/department-ticket.entity';

/**
 * Adapter for department use cases
 */
@Injectable()
export class DepartmentAdapter implements DepartmentProvider {
  constructor(
    private readonly getDepartmentUseCase: GetDepartmentUseCase
  ) {}

  /**
   * Gets department information by ID
   * @param id The department ID
   */
  async getById(id: string): Promise<{ id: string; name: string } | null> {
    try {
      const department = await this.getDepartmentUseCase.execute(id);
      if (!department) return null;
      
      return {
        id: department.id,
        name: department.name
      };
    } catch (error) {
      // If not found, return null
      if (error.name === 'NotFoundException') {
        return null;
      }
      throw error;
    }
  }
  
  /**
   * Checks if a department exists
   * @param id The department ID
   */
  async exists(id: string): Promise<boolean> {
    try {
      const department = await this.getDepartmentUseCase.execute(id);
      return !!department;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Maps a department to a DepartmentTicketEntity
   * @param department The department data
   */
  mapToDepartmentTicket(department: any): DepartmentTicketEntity {
    return new DepartmentTicketEntity({
      id: department.id,
      name: department.name
    });
  }
}