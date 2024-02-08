import { Message } from '@chat/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageService {
  async newMessage(authorId: number, dto: Message) {
    // TODO: find roomByParticipants
    //TODO: create new Message
    //TODO publish notifications
    //TODO: send message to room
  }

  async getMessages(roomId: number) {}

  async readMessages(latestMessageId: number) {}
}
