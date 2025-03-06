import { Global, Module, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_PIPE } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { User, UserSchema } from '../user/schemas/user.schema';

// Presentation layer
import { CompanyController } from './presentation/controllers/company.controller';

// Infrastructure layer
import { Company, CompanySchema } from './infrastructure/schemas/company.schema';
import { Contract, ContractSchema } from './infrastructure/schemas/contract.schema';
import { MongoCompanyRepository } from './infrastructure/repositories/mongo-company.repository';

// Domain layer
import { COMPANY_REPOSITORY } from './domain/ports/company.repository';

// Application layer
import { CreateCompanyUseCase } from './application/use-cases/create-company.use-case';
import { UpdateCompanyUseCase } from './application/use-cases/update-company.use-case';
import { DeleteCompanyUseCase } from './application/use-cases/delete-company.use-case';
import { GetCompanyUseCase } from './application/use-cases/get-company.use-case';
import { GetCompaniesUseCase } from './application/use-cases/get-companies.use-case';
import { AddContractUseCase } from './application/use-cases/add-contract.use-case';
import { RemoveContractUseCase } from './application/use-cases/remove-contract.use-case';
import { CompanyEventListener } from './application/events/company-event.listener';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
      { name: Contract.name, schema: ContractSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CompanyController],
  providers: [
    // Validation Pipe
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    JwtService,

    // Repository
    {
      provide: COMPANY_REPOSITORY,
      useClass: MongoCompanyRepository,
    },

    // Use Cases
    CreateCompanyUseCase,
    UpdateCompanyUseCase,
    DeleteCompanyUseCase,
    GetCompanyUseCase,
    GetCompaniesUseCase,
    AddContractUseCase,
    RemoveContractUseCase,

    // Event Handlers
    CompanyEventListener,
  ],
  exports: [
    {
      provide: COMPANY_REPOSITORY,
      useClass: MongoCompanyRepository,
    },
    CreateCompanyUseCase,
    GetCompanyUseCase,
    GetCompaniesUseCase,
  ],
})
export class CompanyModule {}
