import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class GetMessagesParam {
  @IsNotEmpty()
  @IsUUID()
  roomId: string;
}

export class GetMessagesQuery {
  @IsOptional()
  @IsNumberString()
  latestMessageId: string;
}
