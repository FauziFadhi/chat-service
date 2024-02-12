import { Controller, Inject, Logger } from '@nestjs/common';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';
import { Message } from '@chat/types';
import { KAFKA } from '@shared/constant';
import { KAFKA_MSG } from '@shared/types';
import { EventHandlerService } from '@chat/services/event-handler.service';

@Controller()
export class EventHandler {
  constructor(
    private readonly eventHandlerService: EventHandlerService,
    @Inject(KAFKA.CLIENT)
    private readonly kafkaClient: ClientKafka,
  ) {}
  @EventPattern(KAFKA.MESSAGE_CREATED_TOPIC)
  async messageCreated(@Payload() message: Message) {
    await this.eventHandlerService.messageCreated(message).catch((e) => {
      Logger.error(
        {
          message: 'failed to store message for room ID: ' + message.roomId,
          ref: { message },
          cause: e.message,
        },
        e.stack,
      );
      this.kafkaClient.emit<any, KAFKA_MSG['chats.message-created-retry']>(
        KAFKA.RETRY_MESSAGE_CREATED_TOPIC,
        {
          value: { ...message, attempt: 1 },
          key: { roomId: message.roomId },
        },
      );
    });
  }

  @EventPattern(KAFKA.RETRY_MESSAGE_CREATED_TOPIC)
  async retryMessageCreated(@Payload() message: Message & { attempt: number }) {
    if (message.attempt > 3) return;

    await this.eventHandlerService.messageCreated(message).catch((e) => {
      Logger.error(
        {
          message: 'failed to store message for room ID: ' + message.roomId,
          ref: { message },
          cause: e.message,
        },
        e.stack,
      );
      this.kafkaClient.emit<any, KAFKA_MSG['chats.message-created-retry']>(
        KAFKA.RETRY_MESSAGE_CREATED_TOPIC,
        {
          value: { ...message, attempt: message.attempt + 1 },
          key: { roomId: message.roomId },
        },
      );
    });
  }
}
