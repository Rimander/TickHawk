import { Expose, Transform } from 'class-transformer';

export class DepartmentDto {
  @Expose()
  @Transform(({ value, obj }) => {
    // Intentar obtener _id de varias fuentes posibles
    return (value || obj?._id || obj?.id)?.toString() || undefined;
  })
  _id: string;

  @Expose()
  name: string;
}