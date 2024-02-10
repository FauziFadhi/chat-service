import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from '@chat/chat.module';
import { AccountModule } from './account/account.module';

@Module({
  imports: [ChatModule, AccountModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
