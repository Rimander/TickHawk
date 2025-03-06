import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthRepository } from '../../domain/ports/auth.repository';
import { TokenEntity } from '../../domain/entities/token.entity';
import { Token, TokenDocument } from '../schemas/token.schema';

@Injectable()
export class MongoAuthRepository implements AuthRepository {
  private readonly logger = new Logger(MongoAuthRepository.name);

  constructor(
    @InjectModel(Token.name) private readonly tokenModel: Model<TokenDocument>,
  ) {}

  /**
   * Mapea un documento Mongoose a una entidad de dominio
   */
  private mapToDomainEntity(tokenDoc: any): TokenEntity {
    if (!tokenDoc) return null;

    // Convertir documento Mongoose a objeto plano si no lo es ya
    const token = tokenDoc.toObject ? tokenDoc.toObject() : tokenDoc;

    return new TokenEntity({
      id: token._id.toString(),
      _id: token._id.toString(),
      userId: token.userId.toString(),
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      blocked: token.blocked,
      expiration: token.expiration,
      createdAt: token.createdAt
    });
  }

  async createToken(token: TokenEntity): Promise<TokenEntity> {
    try {
      this.logger.debug(`Creating token for user ${token.userId}`);
      
      const newToken = new this.tokenModel({
        userId: new Types.ObjectId(token.userId),
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        blocked: token.blocked,
        expiration: token.expiration
      });

      const savedToken = await newToken.save();
      return this.mapToDomainEntity(savedToken);
    } catch (error) {
      this.logger.error(`Error creating token: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findToken(accessToken: string, refreshToken: string): Promise<TokenEntity | null> {
    try {
      this.logger.debug(`Finding token by accessToken: ${accessToken.substring(0, 15)}... and refreshToken: ${refreshToken.substring(0, 15)}...`);
      
      const token = await this.tokenModel.findOne({
        accessToken: accessToken,
        refreshToken: refreshToken,
      });

      return token ? this.mapToDomainEntity(token) : null;
    } catch (error) {
      this.logger.error(`Error finding token: ${error.message}`, error.stack);
      throw error;
    }
  }

  async blockToken(accessToken: string): Promise<boolean> {
    try {
      this.logger.debug(`Blocking token with accessToken: ${accessToken.substring(0, 15)}...`);
      
      const result = await this.tokenModel.updateOne(
        { accessToken: accessToken },
        { blocked: true }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      this.logger.error(`Error blocking token: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteToken(accessToken: string): Promise<boolean> {
    try {
      this.logger.debug(`Deleting token with accessToken: ${accessToken.substring(0, 15)}...`);
      
      const result = await this.tokenModel.deleteMany({
        accessToken: accessToken
      });

      return result.deletedCount > 0;
    } catch (error) {
      this.logger.error(`Error deleting token: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteAllUserTokens(userId: string): Promise<boolean> {
    try {
      this.logger.debug(`Deleting all tokens for user ${userId}`);
      
      const result = await this.tokenModel.deleteMany({
        userId: new Types.ObjectId(userId)
      });

      return result.deletedCount > 0;
    } catch (error) {
      this.logger.error(`Error deleting user tokens: ${error.message}`, error.stack);
      throw error;
    }
  }

  async validateRefreshToken(refreshToken: string): Promise<TokenEntity | null> {
    try {
      this.logger.debug(`Validating refresh token: ${refreshToken.substring(0, 15)}...`);
      
      const token = await this.tokenModel.findOne({
        refreshToken: refreshToken,
        blocked: false,
        expiration: { $gt: new Date() }
      });

      return token ? this.mapToDomainEntity(token) : null;
    } catch (error) {
      this.logger.error(`Error validating refresh token: ${error.message}`, error.stack);
      throw error;
    }
  }
}