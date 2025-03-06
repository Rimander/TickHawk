import { Injectable } from '@nestjs/common';
import { GetDepartmentUseCase } from '../department/application/use-cases/get-department.use-case';

/**
 * Adaptador para usar los casos de uso de Department en TicketService
 * Este adaptador proporciona métodos similares a los que existían en DepartmentService
 * pero utilizando los nuevos casos de uso de la arquitectura hexagonal.
 */
@Injectable()
export class DepartmentServiceAdapter {
  constructor(
    private readonly getDepartmentUseCase: GetDepartmentUseCase
  ) {}

  /**
   * Obtiene un departamento por su ID
   * @param id ID del departamento
   * @returns La entidad de departamento o null si no existe
   */
  async getById(id: string) {
    try {
      return await this.getDepartmentUseCase.execute(id);
    } catch (error) {
      // Si no se encuentra el departamento, devolvemos null en lugar de lanzar una excepción
      // para mantener la compatibilidad con el comportamiento anterior
      if (error.name === 'NotFoundException') {
        return null;
      }
      throw error;
    }
  }
}