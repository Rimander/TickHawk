/**
 * Event emitted when a department is deleted
 */
export class DepartmentDeletedEvent {
  constructor(
    public readonly departmentId: string,
    public readonly departmentData: {
      name: string;
    }
  ) {}
}