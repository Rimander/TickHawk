/**
 * Entidad de dominio para departamento
 */
export class DepartmentEntity {
  id?: string;
  _id?: string; // Para compatibilidad
  name: string;

  constructor(data: {
    id?: string;
    _id?: string;
    name: string;
  }) {
    this.id = data.id || data._id;
    this._id = data.id || data._id; // Para asegurar que _id y id son consistentes
    this.name = data.name;
  }

  /**
   * Actualiza los datos del departamento
   * @param data Datos a actualizar
   */
  update(data: { name?: string }): void {
    if (data.name) this.name = data.name;
  }
}