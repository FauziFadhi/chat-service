import { CassandraClient } from '@config/cassandra/client';
import { v4 as uuid } from 'uuid';

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@shared/models/User';
import { ExcludeTime } from '@shared/types';

@Injectable()
export class AccountService {
  constructor(private readonly cassandraClient: CassandraClient) {}

  /**
   * simple login that generate token based on username
   * @param username
   * @returns
   */
  async login(username: string) {
    const result = await this.cassandraClient.execute(
      `SELECT * from users WHERE username = ?;`,
      [username],
    );

    if (!result.rowLength) {
      throw new UnauthorizedException('username not registered.');
    }

    return this.#generatedToken(result.first().get('id'));
  }

  /**
   * register user and generate tokenj
   * @param dto
   * @returns
   */
  async register(dto: { username: string; name: string }) {
    const existingUser = await this.cassandraClient.execute(
      `SELECT * from users WHERE username = ?`,

      [dto.username],
    );

    if (existingUser.rowLength) {
      throw new BadRequestException('username already exists');
    }

    const userUUID = uuid();
    const currentTime = new Date();
    await this.cassandraClient.execute(
      `INSERT INTO users (id, username, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
      [userUUID, dto.username, dto.name, currentTime, currentTime],
    );

    return this.#generatedToken(userUUID);
  }

  /**
   * generated basic token based on username
   * @param username
   * @returns
   */
  async #generatedToken(username: string) {
    return Buffer.from(`${username}:${'password'}`).toString('base64');
  }

  /**
   * get user by id
   * @param id
   * @returns
   */
  async getUserById(id: string): Promise<ExcludeTime<User> | null> {
    const result = await this.cassandraClient.execute(
      `SELECT * from users WHERE id = ?`,
      [id],
    );

    if (!result.rowLength) {
      return null;
    }

    return {
      id: result.first().get('id'),
      username: result.first().get('username'),
      name: result.first().get('name'),
    };
  }

  async getUsers(exceptId?: string): Promise<ExcludeTime<User>[]> {
    const query = exceptId
      ? `SELECT * from users WHERE id != ?`
      : `SELECT * from users`;

    const params = exceptId ? [exceptId] : [];
    const result = await this.cassandraClient.execute(query, params, {
      prepare: true,
    });
    return result.rows.map((row) => ({
      id: row.get('id'),
      username: row.get('username'),
      name: row.get('name'),
    }));
  }
}
