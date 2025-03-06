import { Injectable } from '@nestjs/common';
import { GetCompanyUseCase } from '../company/application/use-cases/get-company.use-case';

/**
 * Adaptador para usar los casos de uso de Company en TicketService
 * Este adaptador proporciona métodos similares a los que existían en CompanyService
 * pero utilizando los nuevos casos de uso de la arquitectura hexagonal.
 */
@Injectable()
export class CompanyServiceAdapter {
  constructor(
    private readonly getCompanyUseCase: GetCompanyUseCase
  ) {}

  /**
   * Obtiene una compañía por su ID
   * @param id ID de la compañía
   * @returns La entidad de compañía o null si no existe
   */
  async getById(id: string) {
    try {
      return await this.getCompanyUseCase.execute(id);
    } catch (error) {
      // Si no se encuentra la compañía, devolvemos null en lugar de lanzar una excepción
      // para mantener la compatibilidad con el comportamiento anterior
      if (error.name === 'NotFoundException') {
        return null;
      }
      throw error;
    }
  }
}