export type TextContent = {
  type: 'text';
  message: string;
  attachments?: string[];
};

export type MediaContent = {
  type: 'video' | 'voice';
  buffer: Buffer;
};

export type Message = {
  authorId: number;
  type: 'private' | 'group';
  roomId: number;
  content: TextContent | MediaContent;
  // replyToMessageId?: number;
  // forwardFromMessageId?: number;
};
