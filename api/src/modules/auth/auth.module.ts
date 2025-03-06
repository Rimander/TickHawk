import { Module, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';

// Presentation layer
import { AuthController } from './presentation/controllers/auth.controller';

// Infrastructure layer
import { Token, TokenSchema } from './infrastructure/schemas/token.schema';
import { MongoAuthRepository } from './infrastructure/repositories/mongo-auth.repository';

// Domain layer
import { AUTH_REPOSITORY } from './domain/ports/auth.repository';

// Application layer
import { SignInUseCase } from './application/use-cases/sign-in.use-case';
import { SignOutUseCase } from './application/use-cases/sign-out.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    // Repository
    {
      provide: AUTH_REPOSITORY,
      useClass: MongoAuthRepository,
    },
    // Use Cases
    SignInUseCase,
    SignOutUseCase,
    RefreshTokenUseCase,
    ForgotPasswordUseCase,
  ],
  controllers: [AuthController],
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
    UserModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '30m' },
      }),
    }),
  ],
  exports: [
    // Repository
    {
      provide: AUTH_REPOSITORY,
      useClass: MongoAuthRepository,
    },
  ],
})
export class AuthModule {}
