import { Message } from '@chat/types';
import { KAFKA } from '@shared/constant';

export type ExcludeTime<T> = Omit<T, 'createdAt' | 'updatedAt'>;

export type Time = {
  createdAt: string;
  updatedAt: string;
};

export type KAFKA_MSG = {
  [KAFKA.MESSAGE_CREATED_TOPIC]: {
    value: Message;
    key: { roomId: string };
  };

  [KAFKA.RETRY_MESSAGE_CREATED_TOPIC]: {
    value: Message & { attempt: number };
    key: { roomId: string };
  };

  [KAFKA.MESSAGE_READ_TOPIC]: {
    value: { dateTime: string };
    key: { roomId: string };
  };
};
