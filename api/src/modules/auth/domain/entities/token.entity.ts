import { Types } from 'mongoose';

/**
 * Entidad de dominio para token de autenticación
 */
export class TokenEntity {
  id?: string;
  _id?: string; // Para compatibilidad
  userId: string;
  accessToken: string;
  refreshToken: string;
  blocked: boolean;
  expiration: Date;
  createdAt?: Date;

  constructor(data: {
    id?: string;
    _id?: string;
    userId: string;
    accessToken: string;
    refreshToken: string;
    blocked: boolean;
    expiration: Date;
    createdAt?: Date;
  }) {
    this.id = data.id || data._id;
    this._id = data.id || data._id;
    this.userId = data.userId;
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.blocked = data.blocked;
    this.expiration = data.expiration;
    this.createdAt = data.createdAt || new Date();
  }

  /**
   * Verifica si el token ha expirado
   */
  isExpired(): boolean {
    return this.expiration < new Date();
  }

  /**
   * Bloquea el token
   */
  block(): void {
    this.blocked = true;
  }
}