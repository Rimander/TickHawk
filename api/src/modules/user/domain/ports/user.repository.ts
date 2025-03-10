import { UserEntity } from '../entities/user.entity';

/**
 * Token para inyección de dependencia del repositorio de usuarios
 */
export const USER_REPOSITORY = 'USER_REPOSITORY';

/**
 * Interface for user repository operations
 */
export interface UserRepository {
  /**
   * Checks if any users exist
   */
  exist(): Promise<boolean>;

  /**
   * Creates a new user
   * @param user The user to create
   */
  create(user: UserEntity): Promise<UserEntity>;

  /**
   * Finds a user by ID
   * @param id The user ID
   */
  findById(id: string): Promise<UserEntity | null>;

  /**
   * Finds a user by email
   * @param email The user email
   */
  findByEmail(email: string): Promise<UserEntity | null>;

  /**
   * Finds all users with optional pagination and filtering
   * @param options Pagination and filtering options
   */
  findAll(options?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    role?: string;
  }): Promise<{ 
    users: UserEntity[]; 
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * Updates a user
   * @param id The user ID
   * @param userData The user data to update
   */
  update(id: string, userData: Partial<UserEntity>): Promise<UserEntity | null>;

  /**
   * Assigns a company to a user
   * @param userId The user ID
   * @param companyId The company ID
   */
  assignCompany(userId: string, companyId: string): Promise<UserEntity | null>;

  /**
   * Assigns a department to a user
   * @param userId The user ID
   * @param departmentId The department ID
   */
  assignDepartment(userId: string, departmentId: string): Promise<boolean>;

  /**
   * Removes a department from a user
   * @param userId The user ID
   * @param departmentId The department ID
   */
  removeDepartment(userId: string, departmentId: string): Promise<boolean>;
}