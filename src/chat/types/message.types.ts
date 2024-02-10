export type TextContent = {
  type: 'text';
  message: string;
  attachments?: string[];
};

export type MediaContent = {
  type: 'video' | 'voice';
  buffer: Buffer;
};

export type BaseMessage = {
  authorId: number;
  type: 'private';
  content: TextContent;
};

export type Message = {
  authorId: string;
  type: 'private';
  roomId: string;
  content: TextContent;
  // replyToMessageId?: number;
  // forwardFromMessageId?: number;
};
