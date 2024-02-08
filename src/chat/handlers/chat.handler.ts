import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Cache } from 'cache-manager';
import { Server, Socket } from 'socket.io';
import { ClientEvent, Message, ReceiverMessage, User } from '@chat/types';
import { JOIN_EVENT, MESSAGE_EVENT } from '@chat/constant/event.constant';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

type SocketType = Socket<any, any, any, User>;
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chats',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject('kafka-client')
    private readonly kafkaClient: ClientKafka,
  ) {}
  @WebSocketServer()
  server: Server<any, ClientEvent>;

  @SubscribeMessage(MESSAGE_EVENT)
  async message(
    @MessageBody() data: Message,
    @ConnectedSocket() client: SocketType,
  ) {
    client.join(`${data.roomId}`);
    await lastValueFrom(
      this.kafkaClient.emit('chats.message-created', {
        value: { ...data, authorId: client.data.userId },
        key: { roomId: data.roomId },
      }),
    );
  }

  @SubscribeMessage(JOIN_EVENT)
  async join(
    @MessageBody() data: Message,
    @ConnectedSocket() client: SocketType,
  ) {
    client.join(`${data.roomId}`);
  }

  async sendMessageToReceiver(roomId: number, message: ReceiverMessage) {
    const authorClientId = await this.cacheManager.get<string>(
      `${message.authorId}`,
    );
    this.server
      .to(`${roomId}`)
      .except(`${authorClientId}`)
      .emit('reply', message);
  }

  async sendNotification(
    roomParticipantIds: number[],
    message: Pick<ReceiverMessage, 'roomId' | 'authorId'>,
  ) {
    const clientIds = (
      await Promise.all(
        roomParticipantIds.map((id) => this.cacheManager.get<string>(`${id}`)),
      )
    ).filter(Boolean) as string[];

    const authorClientId = await this.cacheManager.get<string>(
      `${message.authorId}`,
    );

    this.server
      .to(clientIds)
      .except(`${authorClientId}`)
      .emit('notification', message.roomId);
  }

  async handleConnection(client: SocketType) {
    // TODO: check token
    const userId = client.handshake.headers.authorization;
    if (!userId) {
      client.disconnect();
      return;
    }

    client.data = {
      userId,
    };

    await this.cacheManager.set(`${userId}`, client.id, { ttl: 0 });
  }
  handleDisconnect(client: SocketType) {
    this.cacheManager.del(`${client.data.userId}`);
  }
}
