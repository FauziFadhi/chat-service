import { Message } from './message.types';

export type User = {
  userId: string;
};

export interface ClientEvent {
  reply: (message: Message) => void;
}
