import { Module } from '@nestjs/common';
import { ChatGateway } from './handlers/chat.handler';
import { CacheConfigModule } from 'src/config/cache/config.module';
import { KafkaConfigModule } from 'src/config/kafka/config.module';

@Module({
  imports: [CacheConfigModule, KafkaConfigModule],
  controllers: [],
  providers: [ChatGateway],
})
export class ChatModule {}
