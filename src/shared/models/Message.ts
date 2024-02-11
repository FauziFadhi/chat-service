import { Time } from '@shared/types';

export type Message = Time & {
  id: string;
  roomId: string;
  authorId: string;
  content: string;
  type: string;
};
