/**
 * CompanyTicket entity representing a company in a ticket
 */
export class CompanyTicketEntity {
  id?: string;
  _id?: string;  // Para compatibilidad
  name: string;
  email: string;

  constructor(data: {
    id?: string;
    _id?: string;
    name: string;
    email: string;
  }) {
    this.id = data.id || data._id;
    this._id = data.id || data._id;
    this.name = data.name;
    this.email = data.email;
  }
}