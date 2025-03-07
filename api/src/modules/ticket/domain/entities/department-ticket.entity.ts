/**
 * DepartmentTicket entity representing a department in a ticket
 */
export class DepartmentTicketEntity {
  id?: string;
  _id?: string;  // Para compatibilidad
  name: string;

  constructor(data: {
    id?: string;
    _id?: string;
    name: string;
  }) {
    this.id = data.id || data._id;
    this._id = data.id || data._id;
    this.name = data.name;
  }
}