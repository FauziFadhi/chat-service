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
import {
  ClientEvent,
  Message,
  User,
  NotificationEvent,
  ErrorEvent,
} from '@chat/types';
import { GATEWAY, KAFKA } from '@chat/constant';
import { Inject, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { JoinReq, MessageReq } from './requests/message.request';
import { WsExceptionFilter } from '@utils/ws.exception';
import { PrivateRoomService } from '@chat/services/room.service';

type SocketType = Socket<any, any, any, User>;
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chats',
})
@UsePipes(new ValidationPipe())
@UseFilters(WsExceptionFilter)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server<any, ClientEvent>;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(KAFKA.CLIENT)
    private readonly kafkaClient: ClientKafka,
    private readonly roomService: PrivateRoomService,
  ) {}

  /**
   * @event when client connected
   * @param client
   * @returns
   */
  async handleConnection(client: SocketType) {
    const token = client.handshake.headers.authorization;
    if (!token) {
      client.disconnect();
      return;
    }
    const decodedToken = Buffer.from(token, 'base64').toString();
    const userId = decodedToken?.split(':')?.[0];
    if (!userId) {
      client.disconnect();
      return;
    }

    client.data = {
      userId,
    };

    await this.cacheManager.set(userId, client.id, { ttl: 0 });
  }

  /**
   * @event when client disconnected
   * @param client
   */
  handleDisconnect(client: SocketType) {
    this.cacheManager.del(client.data.userId);
  }
  /**
   * listen `message` event from client and publish to kafka
   * @event
   * @param data
   * @param client
   */
  @SubscribeMessage(GATEWAY.MESSAGE_EVENT)
  async message(
    @MessageBody() data: MessageReq,
    @ConnectedSocket() client: SocketType,
  ) {
    client.join(data.roomId);
    await lastValueFrom(
      this.kafkaClient.emit(KAFKA.MESSAGE_CREATED_TOPIC, {
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
  @SubscribeMessage(GATEWAY.JOIN_EVENT)
  async joinRoom(
    @MessageBody() data: JoinReq,
    @ConnectedSocket() client: SocketType,
  ) {
    client.join(data.roomId);
  }

  @SubscribeMessage(GATEWAY.LEAVE_EVENT)
  async leaveRoom(
    @MessageBody() data: JoinReq,
    @ConnectedSocket() client: SocketType,
  ) {
    client.leave(data.roomId);
  }

  /**
   * send message to websocket client in the room
   * author included for confirmation that message has been sent
   * @param roomId
   * @param message
   */
  async sendMessageToReceiver(roomId: string, message: Message) {
    const authorClientId = await this.cacheManager.get<string>(
      `${message.authorId}`,
    );

    this.server.to(roomId).except(`${authorClientId}`).emit('reply', message);
  }

  /**
   * send notification to websocket client in the room except author
   * @param roomParticipantIds list of room participant
   * @param message
   */
  async sendNotification(receiverIds: string[], message: NotificationEvent) {
    const clientIds = (
      await Promise.all(
        receiverIds.map((id) => this.cacheManager.get<string>(id)),
      )
    ).filter(Boolean) as string[];

    this.server.to(clientIds).emit('notification', message);
  }

  /**
   * send failed event to client
   * @param authorId
   * @param error
   * @returns
   */
  async sendFailedSendMessage(authorId: string, error: ErrorEvent) {
    const authorClientId = await this.cacheManager.get<string>(authorId);
    if (!authorClientId) return;

    this.server.to(authorClientId).emit('error', error);
  }
}
