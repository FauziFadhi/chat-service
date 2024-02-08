import { Module } from '@nestjs/common';
import { ChatGateway } from './handlers/chat.handler';

@Module({
  imports: [],
  controllers: [],
  providers: [ChatGateway],
})
export class ChatModule {}
