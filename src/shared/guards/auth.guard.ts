import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AccountService } from 'src/account/services/account.service';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private readonly accountService: AccountService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.get('Authorization');
    if (!token) throw new UnauthorizedException();

    const decodedToken = Buffer.from(token, 'base64').toString();
    const userId = decodedToken?.split(':')?.[0];

    if (!userId) {
      throw new UnauthorizedException();
    }

    const user = await this.accountService.getUserById(userId).catch((e) => {
      Logger.error(
        { message: `Failed get user by id ${userId}`, cause: e.message },
        e.stack,
      );
      throw new UnauthorizedException();
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    request.user = {
      userId,
    };

    if (!request.user) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
