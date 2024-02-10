import { IsNotEmpty, IsString } from 'class-validator';

export class LoginReq {
  @IsNotEmpty()
  @IsString()
  username: string;
}
