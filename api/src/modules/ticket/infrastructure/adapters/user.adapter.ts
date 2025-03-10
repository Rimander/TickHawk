import { Injectable } from '@nestjs/common';
import { GetUserUseCase } from '../../../user/application/use-cases/get-user.use-case';
import { UserProvider } from '../../domain/ports/user.provider';
import { UserTicketEntity } from '../../domain/entities/user-ticket.entity';
import { Types } from 'mongoose';

/**
 * Adapter for user service
 */
@Injectable()
export class UserAdapter implements UserProvider {
  constructor(
    private readonly getUserUseCase: GetUserUseCase
  ) {}

  /**
   * Finds a user by ID
   * @param id The user ID
   */
  async findById(id: string): Promise<{ id: string; name: string; email: string; role: string; companyId?: string } | null> {
    try {
      const user = await this.getUserUseCase.execute(id);
      if (!user) return null;
      
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId?.toString()
      };
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Checks if a user exists
   * @param id The user ID
   */
  async exists(id: string): Promise<boolean> {
    try {
      const user = await this.getUserUseCase.execute(id);
      return !!user;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Checks if a user belongs to a company
   * @param userId The user ID
   * @param companyId The company ID
   */
  async belongsToCompany(userId: string, companyId: string): Promise<boolean> {
    try {
      const user = await this.getUserUseCase.execute(userId);
      if (!user || !user.companyId) return false;
      
      return user.companyId.toString() === companyId;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Maps a user to a UserTicketEntity
   * @param user The user data
   */
  mapToUserTicket(user: any): UserTicketEntity {
    return new UserTicketEntity({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  }
}