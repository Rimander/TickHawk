/**
 * Event emitted when a department is updated
 */
export class DepartmentUpdatedEvent {
  constructor(
    public readonly departmentId: string,
    public readonly updates: {
      name?: string;
    }
  ) {}
}