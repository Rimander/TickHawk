/**
 * Contract entity representing a contract between a company and the platform
 */
export class ContractEntity {
  id?: string;
  name: string;
  hours: number;
  type: 'infinite' | 'one-time' | 'recurring';
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'inactive' | 'finished';
  created_at?: Date;

  constructor(data: {
    id?: string;
    name: string;
    hours: number;
    type: 'infinite' | 'one-time' | 'recurring';
    startDate: Date;
    endDate?: Date;
    status: 'active' | 'inactive' | 'finished';
    created_at?: Date;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.hours = data.hours;
    this.type = data.type;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.status = data.status;
    this.created_at = data.created_at || new Date();
  }
}