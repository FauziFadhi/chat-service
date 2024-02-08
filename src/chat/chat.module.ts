import { Module } from '@nestjs/common';
import { ChatGateway } from './handlers/chat.handler';
import { CacheConfigModule } from 'src/config/cache/config.module';
import { KafkaConfigModule } from 'src/config/kafka/config.module';
import { EventHandler } from './handlers/event.handler';
import { MessageService } from './services/message.service';

@Module({
  imports: [CacheConfigModule, KafkaConfigModule],
  controllers: [EventHandler],
  providers: [ChatGateway, MessageService],
})
export class ChatModule {}
