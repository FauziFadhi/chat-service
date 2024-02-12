import { Controller, Inject, Logger } from '@nestjs/common';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';
import { ChatGateway } from '../gateway/chat.gateway';
import { MessageService } from '@chat/services/message.service';
import { Message } from '@chat/types';
import { PrivateRoomService } from '@chat/services/room.service';
import { KAFKA } from '@shared/constant';
import { KAFKA_MSG } from '@shared/types';

@Controller()
export class EventHandler {
  constructor(
    private readonly chatGateway: ChatGateway,
    private readonly messageService: MessageService,
    private readonly roomService: PrivateRoomService,
    @Inject(KAFKA.CLIENT)
    private readonly kafkaClient: ClientKafka,
  ) {}
  @EventPattern(KAFKA.MESSAGE_CREATED_TOPIC)
  async messageCreated(@Payload() message: Message) {
    const room = await this.roomService.getRoomById(message.roomId);

    if (!room) {
      this.chatGateway.sendFailedSendMessage(message.authorId, {
        name: 'chat_404',
        roomId: message.roomId,
      });
      return;
    }

    if (!room.participantIds.includes(message.authorId)) {
      this.chatGateway.sendFailedSendMessage(message.authorId, {
        name: 'chat_404',
        roomId: message.roomId,
      });
      return;
    }
    const { messageId } = await this.messageService
      .storeMessage(message)
      .catch((e) => {
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
        return { messageId: null };
      });
    if (!messageId) return;

    await this.chatGateway.sendMessageToReceiver(message.roomId, message);

    await Promise.all([
      // send notification new inbox
      this.chatGateway.sendNotification(
        room.participantIds.filter((id) => id !== message.authorId),
        {
          name: 'inbox',
          content: {
            messageId,
            roomId: message.roomId,
            authorId: message.authorId,
            message: 'new message received',
          },
        },
      ),
      this.chatGateway.sendNotification([message.authorId], {
        // send notification message sent
        name: 'sent',
        content: {
          roomId: message.roomId,
          message: 'message sent',
        },
      }),
    ]);
  }
}
