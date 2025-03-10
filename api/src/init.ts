import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from './modules/user/presentation/dtos/in/create-user.dto';
import { USER_REPOSITORY, UserRepository } from './modules/user/domain/ports/user.repository';
import { UserEntity } from './modules/user/domain/entities/user.entity';

@Injectable()
export class AppInit implements OnModuleInit {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Verify if there are users in the database
    const existingUser = await this.userRepository.exist();

    if (existingUser) {
      return;
    } 

    //TODO: Init company

    const defaultUser = {
      name:
        this.configService.get<string>('DEFAULT_USER_USERNAME') || 'tickhawk',
      password:
        this.configService.get<string>('DEFAULT_USER_PASSWORD') || 'tickhawk',
      email:
        this.configService.get<string>('DEFAULT_USER_EMAIL') ||
        'admin@tickhawk.com',
      role: 'admin',
    };

    // Create a default user
    const user = plainToInstance(CreateUserDto, defaultUser);
    await this.userRepository.create(new UserEntity(user));
  }
}
