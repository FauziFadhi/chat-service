import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway/chat.gateway';
import { EventHandler } from './handlers/event.handler';
import { MessageService } from './services/message.service';
import { CacheConfigModule } from '@config/cache/config.module';
import { KafkaConfigModule } from '@config/kafka/config.module';
import { CassandraConfigModule } from '@config/cassandra/config.module';
import { PrivateRoomService } from './services/room.service';
import { RoomController } from './controllers/room.controller';
import { AccountModule } from 'src/account/account.module';
import { MessageController } from './controllers/message.controller';

@Module({
  imports: [
    CacheConfigModule,
    KafkaConfigModule,
    CassandraConfigModule,
    AccountModule,
  ],
  controllers: [EventHandler, RoomController, MessageController],
  providers: [ChatGateway, MessageService, PrivateRoomService],
})
export class ChatModule {}
