import { Expose } from 'class-transformer';
import { ExposeId } from 'src/config/expose-id.decorator';

export class FileDto {
  @Expose()
  @ExposeId()
  _id: string;

  @Expose()
  name: string;

  @Expose()
  file: string;

  @Expose()
  mimetype: string;

  @Expose()
  size: number;

  @Expose()
  status: string;

  @Expose()
  createdAt: Date;
}