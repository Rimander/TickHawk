/**
 * Event emitted when a new department is created
 */
export class DepartmentCreatedEvent {
  constructor(
    public readonly departmentId: string,
    public readonly departmentData: {
      name: string;
    }
  ) {}
}