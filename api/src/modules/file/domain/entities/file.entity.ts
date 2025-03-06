export type FileStatus = 'temporal' | 'active';

export class FileEntity {
  constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _file: string,
    private readonly _userId: string,
    private readonly _path: string,
    private readonly _mimetype: string,
    private readonly _size: number,
    private readonly _status: FileStatus,
    private readonly _createdAt: Date,
  ) {}

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get file(): string {
    return this._file;
  }

  get userId(): string {
    return this._userId;
  }

  get path(): string {
    return this._path;
  }

  get mimetype(): string {
    return this._mimetype;
  }

  get size(): number {
    return this._size;
  }

  get status(): FileStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  static create(params: {
    id: string;
    name: string;
    file: string;
    userId: string;
    path: string;
    mimetype: string;
    size: number;
    status: FileStatus;
    createdAt?: Date;
  }): FileEntity {
    return new FileEntity(
      params.id,
      params.name,
      params.file,
      params.userId,
      params.path,
      params.mimetype,
      params.size,
      params.status,
      params.createdAt || new Date(),
    );
  }

  isPublic(): boolean {
    return this._path.includes('public');
  }

  toJSON() {
    return {
      id: this._id,
      name: this._name,
      file: this._file,
      userId: this._userId,
      path: this._path,
      mimetype: this._mimetype,
      size: this._size,
      status: this._status,
      createdAt: this._createdAt,
    };
  }
}