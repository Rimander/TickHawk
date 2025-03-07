/**
 * FileTicket entity representing a file attached to a ticket or comment
 */
export class FileTicketEntity {
  id?: string;
  _id?: string;  // Para compatibilidad
  name: string;
  mimetype: string;

  constructor(data: {
    id?: string;
    _id?: string;
    name: string;
    mimetype: string;
  }) {
    this.id = data.id || data._id;
    this._id = data.id || data._id;
    this.name = data.name;
    this.mimetype = data.mimetype;
  }
}