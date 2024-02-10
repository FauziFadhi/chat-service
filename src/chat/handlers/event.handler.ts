import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ChatGateway } from '../gateway/chat.gateway';
import { MessageService } from '@chat/services/message.service';
import { Message } from '@chat/types';
import { MESSAGE_CREATED_TOPIC } from '@chat/constant';
import { PrivateRoomService } from '@chat/services/room.service';

@Controller()
export class EventHandler {
  constructor(
    private readonly chatGateway: ChatGateway,
    private readonly messageService: MessageService,
    private readonly roomService: PrivateRoomService,
  ) {}
  @EventPattern(MESSAGE_CREATED_TOPIC)
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
    const { messageId } = await this.messageService.storeMessage(message);
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
