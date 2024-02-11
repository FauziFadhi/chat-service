import { Time } from '@shared/types';

export type PrivateRoom = Time & {
  id: string;
  name: string;
  participantIds: [string, string];
};
