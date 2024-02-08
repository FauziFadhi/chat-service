import { Message } from '@chat/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageService {
  async storeMessage(authorId: number, dto: Message) {
    // TODO: find roomByParticipants
    //TODO: create new Message
  }

  async getRoomParticipants(roomId: number) {}

  async getMessages(roomId: number) {}

  async readMessages(latestMessageId: number) {}
}
