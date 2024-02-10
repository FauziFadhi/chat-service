import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterReq {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}
