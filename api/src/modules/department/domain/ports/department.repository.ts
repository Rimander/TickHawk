import { DepartmentEntity } from '../entities/department.entity';

/**
 * Token para inyección de dependencia del repositorio de departamentos
 */
export const DEPARTMENT_REPOSITORY = 'DEPARTMENT_REPOSITORY';

/**
 * Interface for department repository operations
 */
export interface DepartmentRepository {
  /**
   * Creates a new department
   * @param department The department to create
   */
  create(department: DepartmentEntity): Promise<DepartmentEntity>;

  /**
   * Finds a department by ID
   * @param id The department ID
   */
  findById(id: string): Promise<DepartmentEntity | null>;

  /**
   * Finds all departments
   */
  findAll(): Promise<DepartmentEntity[]>;

  /**
   * Updates a department
   * @param id The department ID
   * @param department The department data to update
   */
  update(id: string, department: Partial<DepartmentEntity>): Promise<DepartmentEntity | null>;

  /**
   * Deletes a department
   * @param id The department ID
   */
  delete(id: string): Promise<boolean>;

  /**
   * Checks if a department has users
   * @param id The department ID
   */
  hasUsers(id: string): Promise<boolean>;

  /**
   * Get users from a department
   * @param id The department ID
   */
  getUsers(id: string): Promise<any[]>;

  /**
   * Assign a user to a department
   * @param departmentId The department ID
   * @param userId The user ID
   */
  assignUser(departmentId: string, userId: string): Promise<boolean>;

  /**
   * Remove a user from a department
   * @param departmentId The department ID
   * @param userId The user ID
   */
  removeUser(departmentId: string, userId: string): Promise<boolean>;
}