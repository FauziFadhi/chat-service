import { Module } from '@nestjs/common';
import { ChatGateway } from './handlers/chat.handler';
import { EventHandler } from './handlers/event.handler';
import { MessageService } from './services/message.service';
import { CacheConfigModule } from '@config/cache/config.module';
import { KafkaConfigModule } from '@config/kafka/config.module';
import { CassandraConfigModule } from '@config/cassandra/config.module';

@Module({
  imports: [CacheConfigModule, KafkaConfigModule, CassandraConfigModule],
  controllers: [EventHandler],
  providers: [ChatGateway, MessageService],
})
export class ChatModule {}
