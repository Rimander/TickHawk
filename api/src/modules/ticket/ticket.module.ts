import { Module, ValidationPipe } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { Ticket, TicketSchema } from './schemas/ticket.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_PIPE } from '@nestjs/core';
import { UserUpdatedListener } from './listeners/user-updated.listener';
import { CompanyEventsListener } from './listeners/company-events.listener';
import { CompanyServiceAdapter } from './ticket.service.adapter';
import { DepartmentServiceAdapter } from './department.service.adapter';
import { DepartmentModule } from '../department/department.module';
import { UserModule } from '../user/user.module';
import { FileModule } from '../file/file.module';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    TicketService,
    UserUpdatedListener,
    CompanyEventsListener,
    CompanyServiceAdapter,
    DepartmentServiceAdapter,
  ],
  controllers: [TicketController],
  imports: [
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]),
    DepartmentModule,
    UserModule,
    FileModule
  ],
})
export class TicketModule {}
