import { Inject, Injectable, Logger } from '@nestjs/common';
import { TICKET_REPOSITORY, TicketRepository } from '../../domain/ports/ticket.repository';
import { USER_PROVIDER, UserProvider } from '../../domain/ports/user.provider';
import { TicketEntity } from '../../domain/entities/ticket.entity';
import { UserRole, UserTicketEntity } from '../../domain/entities/user-ticket.entity';
import { EventEntity, EventType } from '../../domain/entities/event.entity';
import { BadRequestException, ForbiddenException, NotFoundException } from 'src/common/exceptions';

/**
 * Use case for assigning a ticket to an agent
 */
@Injectable()
export class AssignTicketUseCase {
  private readonly logger = new Logger(AssignTicketUseCase.name);

  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepository,
    @Inject(USER_PROVIDER)
    private readonly userProvider: UserProvider,
  ) {}

  /**
   * Assigns a ticket to an agent
   * @param auth The authenticated user information
   * @param _id The ticket ID
   * @param agentId The agent ID to assign
   * @returns The updated ticket
   */
  async execute(
    auth: {
      id: string;
      role: string;
      name?: string;
      email?: string;
      companyId?: string;
    },
    _id: string,
    agentId: string,
  ): Promise<TicketEntity> {
    this.logger.debug(
      `Assigning ticket ${_id} to agent ${agentId} by user ${auth.id}`,
    );

    // Only agents and admins can assign tickets
    if (auth.role !== 'agent' && auth.role !== 'admin') {
      throw new ForbiddenException(
        'Only agents and admins can assign tickets',
        'INSUFFICIENT_PERMISSIONS',
      );
    }

    try {
      // Find the ticket
      const ticket = await this.ticketRepository.findById(_id);

      if (!ticket) {
        throw new NotFoundException('Ticket not found', 'TICKET_NOT_FOUND');
      }

      // For agents, check company access
      if (
        auth.role === 'agent' &&
        auth.companyId &&
        ticket.company.id !== auth.companyId
      ) {
        throw new ForbiddenException(
          'Cannot access tickets from another company',
          'COMPANY_MISMATCH',
        );
      }

      // Check if agent exists and get agent data
      const agent = await this.userProvider.findById(agentId);

      if (!agent) {
        throw new NotFoundException('Agent not found', 'AGENT_NOT_FOUND');
      }

      // Check if agent role is correct
      if (agent.role !== 'agent' && agent.role !== 'admin') {
        throw new BadRequestException(
          'The selected user is not an agent or admin',
          'INVALID_AGENT_ROLE',
        );
      }

      // Create agent entity
      const agentEntity = this.userProvider.mapToUserTicket(agent);

      // Create event for assignment
      const event = new EventEntity({
        type: 'assign-agent' as EventType,
        user: new UserTicketEntity({
          id: auth.id,
          name: auth.name || 'Unknown',
          email: auth.email || 'unknown@example.com',
          role: auth.role as UserRole,
        }),
        data: {
          previousAgent: ticket.agent
            ? {
                id: ticket.agent.id,
                name: ticket.agent.name,
              }
            : null,
          newAgent: {
            id: agentEntity.id,
            name: agentEntity.name,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Add the event
      await this.ticketRepository.addEvent(_id, event);

      // Assign the agent to the ticket
      const updatedTicket = await this.ticketRepository.assignAgent(
        _id,
        agentEntity,
      );

      if (!updatedTicket) {
        throw new NotFoundException(
          'Ticket not found after update',
          'ASSIGNMENT_FAILED',
        );
      }

      return updatedTicket;
    } catch (error) {
      // Rethrow specific exceptions
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Error assigning ticket: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}