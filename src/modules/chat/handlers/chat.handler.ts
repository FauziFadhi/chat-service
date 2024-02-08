import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ClientEvent, Message, User } from './types/chat.types';
import { MESSAGE_EVENT } from '../constant/event.constant';

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

  // TODO: change to redis
  chaters = new Map<string, string>();

  @SubscribeMessage(MESSAGE_EVENT)
  async message(
    @MessageBody() data: Message,
    @ConnectedSocket() client: SocketType,
  ) {
    console.log(this.chaters);
    this.server.to(client.id).emit('reply', data);
  }

  handleConnection(client: SocketType, ...args: any[]) {
    // TODO: check token
    const userId = client.handshake.headers.authorization;
    if (!userId) {
      client.disconnect();
      return;
    }

    client.data = {
      userId,
    };

    this.chaters.set(`${userId}`, client.id);
  }
  handleDisconnect(client: SocketType) {
    this.chaters.delete(`${client.data.userId}`);
  }
}
