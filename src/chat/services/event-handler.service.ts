import { ChatGateway } from '@chat/gateway/chat.gateway';
import { Message } from '@chat/types';
import { Injectable } from '@nestjs/common';
import { MessageService } from './message.service';
import { PrivateRoomService } from './room.service';

@Injectable()
export class EventHandlerService {
  constructor(
    private readonly chatGateway: ChatGateway,
    private readonly messageService: MessageService,
    private readonly roomService: PrivateRoomService,
  ) {}
  async messageCreated(message: Message) {
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
