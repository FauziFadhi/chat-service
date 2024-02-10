import { Message } from '@chat/types';
import { CassandraClient } from '@config/cassandra/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageService {
  constructor(private readonly cassandraClient: CassandraClient) {}

  /**
   * store message with epoch time as Id
   * @param dto
   * @returns {messageId: number}}
   */
  async storeMessage(dto: Message): Promise<{ messageId: number }> {
    const messageId = new Date().getTime() + Math.random() * 1000;
    await this.cassandraClient.execute(
      `
    INSERT INTO messages (id, author_id, room_id, "type", content)
    VALUES (?, ?, ?, ?, ?)`,
      [dto.authorId, dto.roomId, dto.content.type, dto.content.message],
    );

    return {
      messageId,
    };
  }

  async getMessages(roomId: number) {}

  async readMessages(latestMessageId: number) {}
}
