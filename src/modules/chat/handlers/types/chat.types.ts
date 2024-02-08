export type User = {
  userId: string;
};

type TextContent = {
  type: 'text';
  message: string;
  attachments?: string[];
  replyToMessageId?: number;
};

type MediaContent = {
  type: 'video' | 'voice';
  buffer: Buffer;
};

type CommonMessage = {
  content: TextContent | MediaContent;
  replyToMessageId?: number;
  forwardFromMessageId?: number;
};
type PrivateMessage = CommonMessage & {
  type: 'private';
  peerId: number;
};

type GroupMessage = CommonMessage & {
  type: 'group';
  groupId: number;
};

export type Message = PrivateMessage | GroupMessage;

export interface ClientEvent {
  reply: (message: Message) => void;
}
