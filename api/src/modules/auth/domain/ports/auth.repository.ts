import { TokenEntity } from '../entities/token.entity';

/**
 * Token para inyección de dependencia del repositorio de autenticación
 */
export const AUTH_REPOSITORY = 'AUTH_REPOSITORY';

/**
 * Interface for auth repository operations
 */
export interface AuthRepository {
  /**
   * Creates a new token
   * @param token The token to create
   */
  createToken(token: TokenEntity): Promise<TokenEntity>;

  /**
   * Finds a token by access token and refresh token
   * @param accessToken The access token
   * @param refreshToken The refresh token
   */
  findToken(accessToken: string, refreshToken: string): Promise<TokenEntity | null>;

  /**
   * Blocks a token
   * @param accessToken The access token to block
   */
  blockToken(accessToken: string): Promise<boolean>;

  /**
   * Deletes tokens for a user
   * @param accessToken The access token to delete
   */
  deleteToken(accessToken: string): Promise<boolean>;

  /**
   * Deletes all tokens for a user
   * @param userId The user ID
   */
  deleteAllUserTokens(userId: string): Promise<boolean>;

  /**
   * Validates if a refresh token is valid
   * @param refreshToken The refresh token to validate
   */
  validateRefreshToken(refreshToken: string): Promise<TokenEntity | null>;
}