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

export type Message = {
  type: 'private' | 'group';
  roomId: number;
  content: TextContent | MediaContent;
  replyToMessageId?: number;
  forwardFromMessageId?: number;
};

export type ReceiverMessage = Message & {
  authorId: number;
};
