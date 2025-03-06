export class StorageResultEntity {
  constructor(
    private readonly _path: string,
    private readonly _fileIdentifier: string,
  ) {}

  get path(): string {
    return this._path;
  }

  get fileIdentifier(): string {
    return this._fileIdentifier;
  }

  static create(params: {
    path: string;
    fileIdentifier: string;
  }): StorageResultEntity {
    return new StorageResultEntity(
      params.path,
      params.fileIdentifier,
    );
  }

  toJSON() {
    return {
      path: this._path,
      fileIdentifier: this._fileIdentifier,
    };
  }
}