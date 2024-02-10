import { Message } from './message.types';

export type User = {
  userId: string;
};
type NotificationInbox = {
  name: 'inbox';
  content: {
    roomId: string;
    authorId: string;
    messageId: number;
    message: string;
  };
};

type NotificationSent = {
  name: 'sent';
  content: {
    roomId: string;
    message: string;
  };
};

type ErrorRoomNotFound = {
  name: 'chat_404';
  roomId: string;
};

export type ErrorEvent = ErrorRoomNotFound;

export type NotificationEvent = NotificationInbox | NotificationSent;
export interface ClientEvent {
  reply: (message: Message) => void;
  notification: (message: NotificationEvent) => void;
  error: (error: ErrorEvent) => void;
}
