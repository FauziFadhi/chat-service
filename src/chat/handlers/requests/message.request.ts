import { MediaContent, Message, TextContent } from '@chat/types';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';

class MediaContentReq implements MediaContent {
  @IsNotEmpty()
  buffer: Buffer;

  @IsNotEmpty()
  @IsEnum(['video', 'voice'])
  type: 'video' | 'voice';
}

class TextContentReq implements TextContent {
  @IsEnum(['text'])
  @IsNotEmpty()
  type: 'text';

  @IsNotEmpty()
  message: string;

  @IsArray()
  attachments?: string[];
}

export class MessageReq implements Omit<Message, 'authorId'> {
  @IsNotEmpty()
  @IsEnum(['private', 'group'])
  type: 'private' | 'group';

  @IsNotEmpty()
  @IsNumber()
  roomId: number;

  @ValidateNested()
  content: TextContentReq | MediaContentReq;

  // @IsOptional()
  // @IsNumber()
  // replyToMessageId?: number | undefined;
  // @IsOptional()
  // @IsNumber()
  // forwardFromMessageId?: number | undefined;
}
