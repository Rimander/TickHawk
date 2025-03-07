export type UserRole = 'admin' | 'agent' | 'customer';

/**
 * UserTicket entity representing a user in a ticket
 */
export class UserTicketEntity {
  id?: string;
  _id?: string;  // Para compatibilidad
  name: string;
  email: string;
  role: UserRole;
  
  constructor(data: {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    role: UserRole;
  }) {
    this.id = data.id || data._id;
    this._id = data.id || data._id;
    this.name = data.name;
    this.email = data.email;
    this.role = data.role;
  }
  
  /**
   * Checks if the user is an admin
   */
  isAdmin(): boolean {
    return this.role === 'admin';
  }
  
  /**
   * Checks if the user is an agent
   */
  isAgent(): boolean {
    return this.role === 'agent';
  }
  
  /**
   * Checks if the user is a customer
   */
  isCustomer(): boolean {
    return this.role === 'customer';
  }
}