import { Module, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_PIPE } from '@nestjs/core';

// Domain imports
import { TICKET_REPOSITORY } from './domain/ports/ticket.repository';
import { COMPANY_PROVIDER } from './domain/ports/company.provider';
import { DEPARTMENT_PROVIDER } from './domain/ports/department.provider';
import { FILE_PROVIDER } from './domain/ports/file.provider';
import { USER_PROVIDER } from './domain/ports/user.provider';

// Application imports
import { CreateCustomerTicketUseCase } from './application/use-cases/create-customer-ticket.use-case';
import { ReplyCustomerTicketUseCase } from './application/use-cases/reply-customer-ticket.use-case'; 
import { CloseCustomerTicketUseCase } from './application/use-cases/close-customer-ticket.use-case';
import { GetCustomerTicketsUseCase } from './application/use-cases/get-customer-tickets.use-case';
import { GetCustomerTicketUseCase } from './application/use-cases/get-customer-ticket.use-case';
import { DownloadTicketFileUseCase } from './application/use-cases/download-ticket-file.use-case';
import { GetTicketsUseCase } from './application/use-cases/get-tickets.use-case';
import { GetTicketUseCase } from './application/use-cases/get-ticket.use-case';
import { UpdateTicketStatusUseCase } from './application/use-cases/update-ticket-status.use-case';
import { AssignTicketUseCase } from './application/use-cases/assign-ticket.use-case';
import { ReplyAgentTicketUseCase } from './application/use-cases/reply-agent-ticket.use-case';
import { AddInternalCommentUseCase } from './application/use-cases/add-internal-comment.use-case';
import { TicketEventListener } from './application/events/ticket-event.listener';

// Infrastructure imports
import { Ticket, TicketSchema } from './infrastructure/schemas/ticket.schema';
import { MongoTicketRepository } from './infrastructure/repositories/mongo-ticket.repository';
import { CompanyAdapter } from './infrastructure/adapters/company.adapter';
import { DepartmentAdapter } from './infrastructure/adapters/department.adapter';
import { FileAdapter } from './infrastructure/adapters/file.adapter';
import { UserAdapter } from './infrastructure/adapters/user.adapter';


// Presentation imports
import { TicketController } from './presentation/controllers/ticket.controller';

// External modules
import { DepartmentModule } from '../department/department.module';
import { UserModule } from '../user/user.module';
import { FileModule } from '../file/file.module';
import { UserUpdatedListener } from './listeners/user-updated.listener';
import { CompanyEventsListener } from './listeners/company-events.listener';
import { DepartmentEventsListener } from './listeners/department-events.listener';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]),
    DepartmentModule,
    UserModule,
    FileModule
  ],
  controllers: [TicketController],
  providers: [
    // Global pipes
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    
    // Domain providers
    {
      provide: TICKET_REPOSITORY,
      useClass: MongoTicketRepository,
    },
    {
      provide: COMPANY_PROVIDER,
      useClass: CompanyAdapter,
    },
    {
      provide: DEPARTMENT_PROVIDER,
      useClass: DepartmentAdapter,
    },
    {
      provide: FILE_PROVIDER,
      useClass: FileAdapter,
    },
    {
      provide: USER_PROVIDER,
      useClass: UserAdapter,
    },
    
    // Use cases
    CreateCustomerTicketUseCase,
    ReplyCustomerTicketUseCase,
    CloseCustomerTicketUseCase,
    GetCustomerTicketsUseCase,
    GetCustomerTicketUseCase,
    DownloadTicketFileUseCase,
    GetTicketsUseCase,
    GetTicketUseCase,
    UpdateTicketStatusUseCase,
    AssignTicketUseCase,
    ReplyAgentTicketUseCase,
    AddInternalCommentUseCase,
    
    // Event listeners
    TicketEventListener,
    UserUpdatedListener,
    CompanyEventsListener,
    DepartmentEventsListener,
  ],
  exports: [
    // Export use cases for other modules
    CreateCustomerTicketUseCase,
    ReplyCustomerTicketUseCase,
    CloseCustomerTicketUseCase,
    GetCustomerTicketsUseCase,
    GetCustomerTicketUseCase,
    DownloadTicketFileUseCase,
    GetTicketsUseCase,
    GetTicketUseCase,
    UpdateTicketStatusUseCase,
    AssignTicketUseCase,
    ReplyAgentTicketUseCase,
    AddInternalCommentUseCase,
  ]
})
export class TicketModule {}
