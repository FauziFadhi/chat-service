import {
  BaseWsExceptionFilter,
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
import { ClientEvent, Message, User } from '@chat/types';
import { JOIN_EVENT, MESSAGE_EVENT } from '@chat/constant/event.constant';
import { Inject, UseFilters } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { MessageReq } from './requests/message.request';
import { validateOrReject } from 'class-validator';

type SocketType = Socket<any, any, any, User>;
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chats',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server<any, ClientEvent>;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject('kafka-client')
    private readonly kafkaClient: ClientKafka,
  ) {}

  /**
   * @event when client connected
   * @param client
   * @returns
   */
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

  /**
   * @event when client disconnected
   * @param client
   */
  handleDisconnect(client: SocketType) {
    this.cacheManager.del(`${client.data.userId}`);
  }
  /**
   * listen `message` event from client and publish to kafka
   * @event
   * @param data
   * @param client
   */
  @SubscribeMessage(MESSAGE_EVENT)
  @UseFilters(BaseWsExceptionFilter)
  async message(
    @MessageBody() data: MessageReq,
    @ConnectedSocket() client: SocketType,
  ) {
    await validateOrReject(Object.assign(new MessageReq(), data));

    client.join(`${data.roomId}`);

    await lastValueFrom(
      this.kafkaClient.emit('chats.message-created', {
        value: { ...data, authorId: client.data.userId },
        key: { roomId: data.roomId },
      }),
    );
  }

  /**
   * listen `join` event from client
   * @event
   * @param data
   * @param client
   */
  @SubscribeMessage(JOIN_EVENT)
  async join(
    @MessageBody() data: Message,
    @ConnectedSocket() client: SocketType,
  ) {
    client.join(`${data.roomId}`);
  }

  /**
   * send message to websocket client in the room except author
   * @param roomId
   * @param message
   */
  async sendMessageToReceiver(roomId: number, message: Message) {
    const authorClientId = await this.cacheManager.get<string>(
      `${message.authorId}`,
    );

    this.server
      .to(`${roomId}`)
      .except(`${authorClientId}`)
      .emit('reply', message);
  }

  /**
   * send notification to websocket client in the room except author
   * @param roomParticipantIds list of room participant
   * @param message
   */
  async sendNotification(
    roomParticipantIds: number[],
    message: Pick<Message, 'roomId' | 'authorId'>,
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
}
