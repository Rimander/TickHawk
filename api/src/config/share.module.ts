import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import config from './config';
import { APP_GUARD } from '@nestjs/core';
import { JWTGuard } from './guard/jwt/jwt.guard';

@Global()
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JWTGuard,
    },
  ],
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({
      maxListeners: 20,
      wildcard: false,
      verboseMemoryLeak: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database'),
      }),
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('email.host'),
          port: configService.get<number>('email.port'),
          secure: configService.get<boolean>('email.secure'), // true for SMTPS
          auth: {
            user: configService.get<string>('email.auth.user'),
            pass: configService.get<string>('email.auth.pass'),
          },
        },
      }),
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.accessTokenExpiration'),
        },
      }),
    }),
  ],
  exports: [JwtModule, MongooseModule, MailerModule, EventEmitterModule, ScheduleModule],
})
export class ShareModule {}
