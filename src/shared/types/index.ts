export type ExcludeTime<T> = Omit<T, 'createdAt' | 'updatedAt'>;

export type Time = {
  createdAt: string;
  updatedAt: string;
};
