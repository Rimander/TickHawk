import { Global, Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// Presentation layer
import { DepartmentController } from './presentation/controllers/department.controller';

// Infrastructure layer
import { Department, DepartmentSchema } from './infrastructure/schemas/department.schema';
import { MongoDepartmentRepository } from './infrastructure/repositories/mongo-department.repository';

// Domain layer
import { DEPARTMENT_REPOSITORY } from './domain/ports/department.repository';

// Application layer
import { CreateDepartmentUseCase } from './application/use-cases/create-department.use-case';
import { GetDepartmentsUseCase } from './application/use-cases/get-departments.use-case';
import { GetDepartmentUseCase } from './application/use-cases/get-department.use-case';
import { UpdateDepartmentUseCase } from './application/use-cases/update-department.use-case';
import { DeleteDepartmentUseCase } from './application/use-cases/delete-department.use-case';
import { GetDepartmentUsersUseCase } from './application/use-cases/get-department-users.use-case';
import { AssignUserUseCase } from './application/use-cases/assign-user.use-case';
import { RemoveUserUseCase } from './application/use-cases/remove-user.use-case';
import { DepartmentEventListener } from './application/events/department-event.listener';
import { User, UserSchema } from '../user/infrastructure/schemas/user.schema';

@Global()
@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    // Repository
    {
      provide: DEPARTMENT_REPOSITORY,
      useClass: MongoDepartmentRepository,
    },

    // Use Cases
    CreateDepartmentUseCase,
    GetDepartmentsUseCase,
    GetDepartmentUseCase,
    UpdateDepartmentUseCase,
    DeleteDepartmentUseCase,
    GetDepartmentUsersUseCase,
    AssignUserUseCase,
    RemoveUserUseCase,

    // Event Handlers
    DepartmentEventListener,
  ],
  controllers: [DepartmentController],
  imports: [
    MongooseModule.forFeature([
      { name: Department.name, schema: DepartmentSchema },
      { name: User.name, schema: UserSchema },
    ]),
    ConfigModule,
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
      provide: DEPARTMENT_REPOSITORY,
      useClass: MongoDepartmentRepository,
    },
    // Use Cases
    GetDepartmentUseCase,
    GetDepartmentsUseCase,
  ],
})
export class DepartmentModule {}
