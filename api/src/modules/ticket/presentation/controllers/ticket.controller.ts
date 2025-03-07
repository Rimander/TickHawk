import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res, StreamableFile, UseGuards } from '@nestjs/common';
import { JWTGuard } from 'src/config/guard/jwt/jwt.guard';
import { RolesGuard } from 'src/config/guard/roles/roles.guard';
import { Request, Response } from 'express';
import { Roles } from 'src/config/guard/roles/roles.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { BadRequestException } from 'src/common/exceptions';

// Use cases
import { CreateCustomerTicketUseCase } from '../../application/use-cases/create-customer-ticket.use-case';
import { ReplyCustomerTicketUseCase } from '../../application/use-cases/reply-customer-ticket.use-case';
import { CloseCustomerTicketUseCase } from '../../application/use-cases/close-customer-ticket.use-case';
import { GetCustomerTicketsUseCase } from '../../application/use-cases/get-customer-tickets.use-case';
import { GetCustomerTicketUseCase } from '../../application/use-cases/get-customer-ticket.use-case';
import { DownloadTicketFileUseCase } from '../../application/use-cases/download-ticket-file.use-case';
import { GetTicketsUseCase } from '../../application/use-cases/get-tickets.use-case';
import { GetTicketUseCase } from '../../application/use-cases/get-ticket.use-case';
import { UpdateTicketStatusUseCase } from '../../application/use-cases/update-ticket-status.use-case';
import { AssignTicketUseCase } from '../../application/use-cases/assign-ticket.use-case';
import { ReplyAgentTicketUseCase } from '../../application/use-cases/reply-agent-ticket.use-case';

// DTOs
import { CreateCustomerTicketDto } from '../dtos/in/create-customer-ticket.dto';
import { ReplyCommentCustomerTicketDto } from '../dtos/in/reply-comment-customer-ticket.dto';
import { UpdateTicketStatusDto } from '../dtos/in/update-ticket-status.dto';
import { AssignAgentDto } from '../dtos/in/assign-agent.dto';
import { AgentReplyTicketDto } from '../dtos/in/agent-reply-ticket.dto';
import { TicketDto } from '../dtos/out/ticket.dto';

@ApiTags('Tickets')
@Controller('ticket')
@UseGuards(JWTGuard, RolesGuard)
export class TicketController {
  constructor(
    private readonly createCustomerTicketUseCase: CreateCustomerTicketUseCase,
    private readonly replyCustomerTicketUseCase: ReplyCustomerTicketUseCase,
    private readonly closeCustomerTicketUseCase: CloseCustomerTicketUseCase,
    private readonly getCustomerTicketsUseCase: GetCustomerTicketsUseCase,
    private readonly getCustomerTicketUseCase: GetCustomerTicketUseCase,
    private readonly downloadTicketFileUseCase: DownloadTicketFileUseCase,
    private readonly getTicketsUseCase: GetTicketsUseCase,
    private readonly getTicketUseCase: GetTicketUseCase,
    private readonly updateTicketStatusUseCase: UpdateTicketStatusUseCase,
    private readonly assignTicketUseCase: AssignTicketUseCase,
    private readonly replyAgentTicketUseCase: ReplyAgentTicketUseCase,
  ) {}

  @Post('customer')
  @Roles(['customer'])
  @ApiOperation({ summary: 'Create a new ticket if you are a customer' })
  @ApiResponse({
    status: 201,
    description: 'Ticket created successfully',
    type: TicketDto,
  })
  async createCustomerTicket(
    @Body() createTicketDto: CreateCustomerTicketDto,
    @Req() req: Request,
  ): Promise<TicketDto> {
    const ticket = await this.createCustomerTicketUseCase.execute(
      req.user,
      createTicketDto,
    );
    return plainToInstance(TicketDto, ticket, {
      excludeExtraneousValues: true,
    });
  }

  @Post('customer/reply')
  @Roles(['customer'])
  @ApiOperation({ summary: 'Reply to a ticket if you are a customer' })
  @ApiResponse({
    status: 200,
    description: 'Reply added successfully',
    type: TicketDto,
  })
  async replyToTicket(
    @Body() replyDto: ReplyCommentCustomerTicketDto,
    @Req() req: Request,
  ): Promise<TicketDto> {
    const ticket = await this.replyCustomerTicketUseCase.execute(
      req.user,
      replyDto,
    );
    return plainToInstance(TicketDto, ticket, {
      excludeExtraneousValues: true,
    });
  }

  @Post('customer/close/:id')
  @Roles(['customer'])
  @ApiOperation({ summary: 'Close a ticket if you are a customer' })
  @ApiResponse({
    status: 200,
    description: 'Ticket closed successfully',
    type: TicketDto,
  })
  async closeTicket(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<TicketDto> {
    const ticket = await this.closeCustomerTicketUseCase.execute(req.user, id);
    return plainToInstance(TicketDto, ticket, {
      excludeExtraneousValues: true,
    });
  }

  @Get('customer')
  @Roles(['customer'])
  @ApiOperation({ summary: 'Get all tickets of the customer' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated customer tickets',
    type: [TicketDto],
  })
  async getCustomerTickets(@Req() req: Request, @Query('page') page?: number) {
    if (!page || page < 1) {
      page = 1;
    }
    const result = await this.getCustomerTicketsUseCase.execute(req.user, page);

    return {
      tickets: plainToInstance(TicketDto, result.tickets, {
        excludeExtraneousValues: true,
      }),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
  
  @Get('customer/report')
  @Roles(['customer'])
  @ApiOperation({ summary: 'Get tickets for a customer within a date range for reporting' })
  @ApiResponse({
    status: 200,
    description: 'Returns the customer tickets within the date range',
    type: [TicketDto],
  })
  async getCustomerTicketsReport(
    @Req() req: Request,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<TicketDto[]> {
    if (!startDate || !endDate) {
      throw new BadRequestException('Start date and end date are required', 'MISSING_DATE_RANGE');
    }
    
    // Get tickets with filters
    const result = await this.getCustomerTicketsUseCase.execute(req.user, 1, {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      limit: 1000, // High limit to get all tickets
    });
    
    return plainToInstance(TicketDto, result.tickets, {
      excludeExtraneousValues: true,
    });
  }

  @Get('customer/:id')
  @Roles(['customer'])
  @ApiOperation({ summary: 'Get a ticket of the customer' })
  @ApiResponse({
    status: 200,
    description: 'Returns the ticket details',
    type: TicketDto,
  })
  async getCustomerTicket(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<TicketDto> {
    const ticket = await this.getCustomerTicketUseCase.execute(req.user, id);
    return plainToInstance(TicketDto, ticket, {
      excludeExtraneousValues: true,
    });
  }

  @Get('file/:file')
  @Roles(['customer', 'agent', 'admin'])
  @ApiOperation({ summary: 'Download a file from a ticket' })
  @ApiResponse({ status: 200, description: 'Returns the file' })
  async downloadFile(
    @Req() req: Request,
    @Param('file') fileId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const buffer = await this.downloadTicketFileUseCase.execute(
      req.user,
      fileId,
    );
    return new StreamableFile(buffer);
  }

  @Get()
  @Roles(['agent', 'admin'])
  @ApiOperation({ summary: 'Get all tickets (for agents and admins)' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated tickets',
    type: [TicketDto],
  })
  async getAllTickets(@Req() req: Request, @Query('page') page?: number) {
    if (!page || page < 1) {
      page = 1;
    }
    const result = await this.getTicketsUseCase.execute(req.user, page);

    return {
      tickets: plainToInstance(TicketDto, result.tickets, {
        excludeExtraneousValues: true,
      }),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get('company')
  @Roles(['agent', 'admin'])
  @ApiOperation({
    summary: 'Get tickets for a specific company within a date range',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the company tickets',
    type: [TicketDto],
  })
  async getCompanyTickets(
    @Req() req: Request,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('companyId') companyId: string,
  ): Promise<TicketDto[]> {
    // Get tickets with filters
    const result = await this.getTicketsUseCase.execute(req.user, 1, {
      companyId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      limit: 1000, // High limit to get all tickets
    });
    
    return plainToInstance(TicketDto, result.tickets, {
      excludeExtraneousValues: true,
    });
  }
  
  @Get(':id')
  @Roles(['agent', 'admin'])
  @ApiOperation({
    summary: 'Get a specific ticket by ID (for agents and admins)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the ticket details',
    type: TicketDto,
  })
  async getTicket(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<TicketDto> {
    const ticket = await this.getTicketUseCase.execute(req.user, id);
    return plainToInstance(TicketDto, ticket, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id/status')
  @Roles(['admin', 'agent'])
  @ApiOperation({ summary: 'Update ticket status' })
  @ApiResponse({
    status: 200,
    description: 'Ticket status updated successfully',
    type: TicketDto,
  })
  async updateTicketStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateTicketStatusDto
  ): Promise<TicketDto> {
    const ticket = await this.updateTicketStatusUseCase.execute(
      req.user, 
      id, 
      updateStatusDto.status
    );
    return plainToInstance(TicketDto, ticket, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id/assign')
  @Roles(['admin', 'agent'])
  @ApiOperation({ summary: 'Assign ticket to an agent' })
  @ApiResponse({
    status: 200,
    description: 'Ticket assigned successfully',
    type: TicketDto,
  })
  async assignTicket(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() assignAgentDto: AssignAgentDto
  ): Promise<TicketDto> {
    const ticket = await this.assignTicketUseCase.execute(
      req.user, 
      id, 
      assignAgentDto.agentId
    );
    return plainToInstance(TicketDto, ticket, {
      excludeExtraneousValues: true,
    });
  }

  @Post('reply')
  @Roles(['admin', 'agent'])
  @ApiOperation({ summary: 'Reply to a ticket as an agent or admin' })
  @ApiResponse({
    status: 200,
    description: 'Reply added successfully',
    type: TicketDto,
  })
  async replyToTicketAsAgent(
    @Body() agentReplyDto: AgentReplyTicketDto,
    @Req() req: Request,
  ): Promise<TicketDto> {
    const ticket = await this.replyAgentTicketUseCase.execute(req.user, {
      _id: agentReplyDto._id,
      content: agentReplyDto.content,
      minutes: agentReplyDto.minutes,
      files: agentReplyDto.files,
    });
    return plainToInstance(TicketDto, ticket, {
      excludeExtraneousValues: true,
    });
  }
}