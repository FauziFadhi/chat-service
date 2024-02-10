import { MediaContent, Message, TextContent } from '@chat/types';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  isNotEmpty,
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
  @IsEnum(['private'])
  type: 'private';

  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ValidateNested()
  content: TextContentReq;
}

export class JoinReq {
  @IsString()
  @IsNotEmpty()
  roomId: string;
}
