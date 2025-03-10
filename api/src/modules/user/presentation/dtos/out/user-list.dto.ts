import { Expose, Type } from 'class-transformer';
import { ProfileDto } from './profile.dto';

export class UserListDto {
  @Expose()
  @Type(() => ProfileDto)
  users: ProfileDto[];

  @Expose()
  total: number;

  @Expose()
  page: number;

  @Expose()
  limit: number;

  constructor(data?: { users: ProfileDto[], total: number, page: number, limit: number }) {
    if (data) {
      this.users = data.users;
      this.total = data.total;
      this.page = data.page;
      this.limit = data.limit;
    }
  }
}