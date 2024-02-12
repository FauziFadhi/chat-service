import { MessageService } from '@chat/services/message.service';
import { PrivateRoomService } from '@chat/services/room.service';
import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { IAppsUserPayload, User } from 'src/shared/decorators/user.decorator';
import { TokenGuard } from 'src/shared/guards/auth.guard';
import { GetMessagesParam, GetMessagesQuery } from './requests/message.request';

@UseGuards(TokenGuard)
@UsePipes(ValidationPipe)
@Controller({ path: 'rooms/:roomId/messages', version: '1' })
export class MessageController {
  constructor(
    private readonly roomService: PrivateRoomService,
    private readonly messageService: MessageService,
  ) {}

  @Get()
  async getMessages(
    @Param() params: GetMessagesParam,
    @Query() query: GetMessagesQuery,
    @User() user: IAppsUserPayload,
  ) {
    const room = await this.roomService
      .getRoomById(params.roomId)
      .catch((e) => {
        Logger.error(e);
        throw new BadRequestException('room not found');
      });

    if (!room) {
      throw new BadRequestException('room not found');
    }

    if (!room.participantIds.includes(user.userId)) {
      throw new BadRequestException('room not found');
    }
    return await this.messageService.getMessages(
      params.roomId,
      query.context
        ? {
            latestMessageId: query.latestMessageId,
            context: query.context,
          }
        : undefined,
    );
  }
}
