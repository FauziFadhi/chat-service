import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AccountService } from '../services/account.service';
import { LoginReq } from './requests/login.request';
import { RegisterReq } from './requests/register.request';
import { TokenGuard } from '@shared/guards/auth.guard';
import { IAppsUserPayload, User } from '@shared/decorators/user.decorator';

@UsePipes(new ValidationPipe())
@Controller({ path: 'accounts', version: '1' })
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

  @UseGuards(TokenGuard)
  @Post('me')
  async me(@User() user: IAppsUserPayload) {
    return await this.accountService.getUserById(user.userId);
  }

  @Get()
  async list(@User() user?: IAppsUserPayload) {
    return await this.accountService.getUsers(user?.userId);
  }
}
