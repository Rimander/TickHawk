import { DepartmentTicketEntity } from '../entities/department-ticket.entity';

/**
 * Token para inyección de dependencia del proveedor de departamentos
 */
export const DEPARTMENT_PROVIDER = 'DEPARTMENT_PROVIDER';

/**
 * Interface for department provider operations
 */
export interface DepartmentProvider {
  /**
   * Gets department information by ID
   * @param id The department ID
   */
  getById(id: string): Promise<{ id: string; name: string } | null>;
  
  /**
   * Checks if a department exists
   * @param id The department ID
   */
  exists(id: string): Promise<boolean>;
  
  /**
   * Maps a department to a DepartmentTicketEntity
   * @param department The department data
   */
  mapToDepartmentTicket(department: any): DepartmentTicketEntity;
}