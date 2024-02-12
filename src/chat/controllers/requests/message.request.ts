import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class GetMessagesParam {
  @IsNotEmpty()
  @IsUUID()
  roomId: string;
}

export class GetMessagesQuery {
  @ValidateIf((o) => o.context)
  @IsNotEmpty()
  @IsNumberString()
  latestMessageId: string;

  @IsOptional()
  @IsEnum(['before', 'after'])
  context: 'before' | 'after';
}
