import { Global, Module, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_PIPE } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

// Presentation layer
import { UserController } from './presentation/controllers/user.controller';

// Infrastructure layer
import { User, UserSchema } from './infrastructure/schemas/user.schema';
import { MongoUserRepository } from './infrastructure/repositories/mongo-user.repository';

// Domain layer
import { USER_REPOSITORY } from './domain/ports/user.repository';

// Application layer - Use Cases
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { GetUserUseCase } from './application/use-cases/get-user.use-case';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { AssignCompanyUseCase } from './application/use-cases/assign-company.use-case';
import { AssignDepartmentUseCase } from './application/use-cases/assign-department.use-case';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [
    // Validation Pipe
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    JwtService,

    // Repository
    {
      provide: USER_REPOSITORY,
      useClass: MongoUserRepository,
    },

    // Use Cases
    CreateUserUseCase,
    GetUserUseCase,
    GetUsersUseCase,
    UpdateUserUseCase,
    AssignCompanyUseCase,
    AssignDepartmentUseCase,
  ],
  exports: [
    {
      provide: USER_REPOSITORY,
      useClass: MongoUserRepository,
    },
    CreateUserUseCase,
    GetUserUseCase,
    GetUsersUseCase,
    UpdateUserUseCase,
  ],
})
export class UserModule {}
