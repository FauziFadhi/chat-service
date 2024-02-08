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
import { ClientEvent, Message, User } from './types/chat.types';
import { MESSAGE_EVENT } from '../constant/event.constant';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

type SocketType = Socket<any, any, any, User>;
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chats',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}
  @WebSocketServer()
  server: Server<any, ClientEvent>;

  @SubscribeMessage(MESSAGE_EVENT)
  async message(
    @MessageBody() data: Message,
    @ConnectedSocket() client: SocketType,
  ) {
    this.server.to(client.id).emit('reply', data);
  }

  async sendReplyMessage(receiverId: string, message: Message) {
    const receiverClientId = await this.cacheManager.get<string>(receiverId);
    if (!receiverClientId) {
      return;
    }
    this.server.to(receiverClientId).emit('reply', message);
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
