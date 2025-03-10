/**
 * Event emitted when a user is updated
 */
export class UserUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly updates: {
      name?: string;
      email?: string;
      role?: string;
    }
  ) {}
}