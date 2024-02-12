import { Message } from '@chat/types';
import { Message as MessageModel } from '@shared/models/Message';
import { CassandraClient } from '@config/cassandra/client';
import { Injectable } from '@nestjs/common';
import { ExcludeTime } from '@shared/types';

@Injectable()
export class MessageService {
  constructor(private readonly cassandraClient: CassandraClient) {}

  /**
   * store message with epoch time as Id
   * @param dto
   * @returns {messageId: number}}
   */
  async storeMessage(dto: Message): Promise<{ messageId: number }> {
    const currentTime = new Date();
    const messageId = currentTime.getTime() + Math.random() * 1000;
    await this.cassandraClient.execute(
      `
    INSERT INTO messages (id, author_id, room_id, "type", content, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        messageId,
        dto.authorId,
        dto.roomId,
        dto.content.type,
        dto.content.message,
        currentTime,
        currentTime,
      ],
    );

    return {
      messageId,
    };
  }

  /**
   * get messages in a room from latest message or before latest messageId
   * @param roomId
   */
  async getMessages(
    roomId: string,
    dto?: { latestMessageId: string; context: 'before' | 'after' },
  ): Promise<Omit<MessageModel, 'updatedAt'>[]> {
    const params = dto ? [roomId, dto.latestMessageId] : [roomId];

    let query = 'SELECT * FROM messages WHERE room_id = ?';

    if (dto?.context === 'before') {
      query += ' AND id < ?';
    } else if (dto?.context === 'after') {
      query += ' AND id > ?';
    }

    query += ' ORDER BY id DESC LIMIT 10';

    const messages = await this.cassandraClient.execute(query, params, {
      prepare: true,
    });

    return messages.rows.map((message) => ({
      id: message.get('id'),
      authorId: message.get('author_id'),
      roomId: message.get('room_id'),
      type: message.get('type'),
      content: message.get('content'),
      createdAt: message.get('created_at'),
    }));
  }

  async readMessages(latestMessageId: number) {}
}
