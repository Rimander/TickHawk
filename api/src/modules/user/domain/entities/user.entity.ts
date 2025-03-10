/**
 * User entity representing a user in the platform
 */
export class UserEntity {
  id?: string;
  _id?: string;  // Para compatibilidad
  name: string;
  email: string;
  password?: string;
  lang: string;
  role: string;
  companyId?: string;
  departmentIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    password?: string;
    lang?: string;
    role?: string;
    companyId?: string;
    departmentIds?: string[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id || data._id;
    this._id = data.id || data._id;  // Para asegurar que _id y id son consistentes
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.lang = data.lang || 'en';
    this.role = data.role || 'customer';
    this.companyId = data.companyId;
    this.departmentIds = data.departmentIds || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Updates user data
   * @param data Data to update
   */
  update(data: {
    name?: string;
    email?: string;
    password?: string;
    lang?: string;
    role?: string;
  }): void {
    if (data.name) this.name = data.name;
    if (data.email) this.email = data.email;
    if (data.password) this.password = data.password;
    if (data.lang) this.lang = data.lang;
    if (data.role) this.role = data.role;
    this.updatedAt = new Date();
  }

  /**
   * Assign company to user
   * @param companyId Company ID
   */
  assignCompany(companyId: string): void {
    this.companyId = companyId;
    this.updatedAt = new Date();
  }

  /**
   * Remove company assignment
   */
  removeCompany(): void {
    this.companyId = undefined;
    this.updatedAt = new Date();
  }

  /**
   * Assign department to user
   * @param departmentId Department ID
   */
  assignDepartment(departmentId: string): void {
    if (!this.departmentIds) {
      this.departmentIds = [];
    }
    
    if (!this.departmentIds.includes(departmentId)) {
      this.departmentIds.push(departmentId);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remove department from user
   * @param departmentId Department ID
   * @returns True if department was removed, false otherwise
   */
  removeDepartment(departmentId: string): boolean {
    if (!this.departmentIds) {
      return false;
    }
    
    const initialLength = this.departmentIds.length;
    this.departmentIds = this.departmentIds.filter(id => id !== departmentId);
    this.updatedAt = new Date();
    
    return this.departmentIds.length < initialLength;
  }
}