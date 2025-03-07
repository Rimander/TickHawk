import { UserTicketEntity } from '../entities/user-ticket.entity';

/**
 * Token para inyección de dependencia del proveedor de usuarios
 */
export const USER_PROVIDER = 'USER_PROVIDER';

/**
 * Interface for user provider operations
 */
export interface UserProvider {
  /**
   * Finds a user by ID
   * @param id The user ID
   */
  findById(id: string): Promise<{ id: string; name: string; email: string; role: string; companyId?: string } | null>;
  
  /**
   * Checks if a user exists
   * @param id The user ID
   */
  exists(id: string): Promise<boolean>;
  
  /**
   * Checks if a user belongs to a company
   * @param userId The user ID
   * @param companyId The company ID
   */
  belongsToCompany(userId: string, companyId: string): Promise<boolean>;
  
  /**
   * Maps a user to a UserTicketEntity
   * @param user The user data
   */
  mapToUserTicket(user: any): UserTicketEntity;
}