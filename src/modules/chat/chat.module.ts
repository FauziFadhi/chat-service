import { Module } from '@nestjs/common';
import { ChatGateway } from './handlers/chat.handler';
import { CacheConfigModule } from 'src/config/cache/config.module';

@Module({
  imports: [CacheConfigModule],
  controllers: [],
  providers: [ChatGateway],
})
export class ChatModule {}
