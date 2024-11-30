import { Expose } from "class-transformer";

export class CompanyTicketDto {
  @Expose()
  _id: string;
  @Expose()
  name: string;
  @Expose()
  email: string;
}