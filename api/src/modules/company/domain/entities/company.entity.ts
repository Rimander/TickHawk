import { ContractEntity } from './contract.entity';

/**
 * Company entity representing a client company in the platform
 */
export class CompanyEntity {
  id?: string;
  _id?: string;  // Para compatibilidad
  name: string;
  email: string;
  contracts: ContractEntity[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    contracts?: ContractEntity[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id || data._id;
    this._id = data.id || data._id;  // Para asegurar que _id y id son consistentes
    this.name = data.name;
    this.email = data.email;
    this.contracts = data.contracts || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Adds a new contract to the company
   * @param contract The contract to add
   */
  addContract(contract: ContractEntity): void {
    this.contracts.push(contract);
    this.updatedAt = new Date();
  }

  /**
   * Removes a contract from the company
   * @param contractId The ID of the contract to remove
   * @returns True if the contract was removed, false otherwise
   */
  removeContract(contractId: string): boolean {
    const initialLength = this.contracts.length;
    this.contracts = this.contracts.filter(
      (contract) => contract.id !== contractId,
    );
    this.updatedAt = new Date();

    return this.contracts.length < initialLength;
  }

  /**
   * Updates company data
   * @param data Data to update
   */
  update(data: { name?: string; email?: string }): void {
    if (data.name) this.name = data.name;
    if (data.email) this.email = data.email;
    this.updatedAt = new Date();
  }
}