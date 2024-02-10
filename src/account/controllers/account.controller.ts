import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AccountService } from '../services/account.service';
import { LoginReq } from './requests/login.request';
import { RegisterReq } from './requests/register.request';

@UsePipes(new ValidationPipe())
@Controller({ path: 'account', version: '1' })
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('login')
  async login(@Body() body: LoginReq) {
    const token = await this.accountService.login(body.username);

    return {
      token,
    };
  }

  @Post('register')
  async register(@Body() body: RegisterReq) {
    const token = await this.accountService.register(body);

    return {
      token,
    };
  }
}
