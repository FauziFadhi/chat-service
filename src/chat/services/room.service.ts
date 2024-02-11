import { CassandraClient } from '@config/cassandra/client';
import { Injectable } from '@nestjs/common';
import { PrivateRoom } from '@shared/models/PrivateRoom';
import { ExcludeTime } from '@shared/types';
import { v4 as uuid } from 'uuid';

@Injectable()
export class PrivateRoomService {
  constructor(private readonly cassandraClient: CassandraClient) {}

  async getRoomById(roomId: string): Promise<ExcludeTime<PrivateRoom> | null> {
    const result = await this.cassandraClient.execute(
      `SELECT * from private_rooms WHERE id = ?`,
      [roomId],
      {
        prepare: true,
      },
    );

    if (!result.rowLength) {
      return null;
    }

    return {
      id: result.first().get('id'),
      name: result.first().get('name'),
      participantIds: result.first().get('participant_ids'),
    };
  }

  async getRoomIdByParticipantIds(
    participantIds: string[],
  ): Promise<string | null> {
    const result = await this.cassandraClient.execute(
      `SELECT id from private_rooms WHERE participant_ids = ?`,
      [participantIds.sort()],
      {
        prepare: true,
      },
    );

    if (!result.rowLength) {
      return null;
    }

    return result.first().get('id');
  }

  async createRoom(
    room: { name: string },
    roomParticipantIds: string[],
  ): Promise<string> {
    const currentTime = new Date().getTime();
    const roomUUID = uuid();
    await this.cassandraClient.execute(
      `INSERT INTO private_rooms (id, name, participant_ids, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
      [
        roomUUID,
        room.name,
        roomParticipantIds.sort(),
        currentTime,
        currentTime,
      ],
      {
        prepare: true,
      },
    );

    return roomUUID;
  }
}
