import { Controller } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import { ChatGateway } from './chat.handler';
import { MessageService } from '@chat/services/message.service';
import { Message } from '@chat/types';

@Controller()
export class EventHandler {
  constructor(
    private readonly chatGateway: ChatGateway,
    private readonly messageService: MessageService,
  ) {}
  @EventPattern('chats.message-created')
  async messageCreated(
    @Payload() message: Message,
    @Ctx() context: KafkaContext,
  ) {
    await this.messageService.storeMessage(message);
    await this.chatGateway.sendMessageToReceiver(message.roomId, message);
    await this.chatGateway.sendNotification([], message);
  }
}
