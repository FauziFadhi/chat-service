import { Time } from '@shared/types';

export type User = Time & {
  id: string;
  name: string;
  username: string;
};
