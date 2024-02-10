import { PrivateRoomService } from '@chat/services/room.service';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from 'src/account/services/account.service';
import { IAppsUserPayload, User } from 'src/shared/decorators/user.decorator';
import { TokenGuard } from 'src/shared/guards/auth.guard';

@UseGuards(TokenGuard)
@Controller({ path: ':peerId/room', version: '1' })
export class RoomController {
  constructor(
    private readonly roomService: PrivateRoomService,
    private readonly accountService: AccountService,
  ) {}

  @Get()
  async createRoom(
    @Param() params: { peerId: string },
    @User() user: IAppsUserPayload,
  ) {
    if (params.peerId === user.userId) {
      throw new BadRequestException('can not create room with yourself');
    }
    const participantIds = [params.peerId, user.userId];

    const peer = await this.accountService.getUserById(params.peerId);

    if (!peer) {
      throw new BadRequestException('peer not found');
    }
    const roomId = await this.roomService.getRoomIdByParticipantIds(
      participantIds,
    );
    if (roomId) {
      return {
        roomId,
      };
    }
    const newRoomId = await this.roomService.createRoom(
      { name: `${params.peerId}-${user.userId}` },
      participantIds,
    );

    return {
      roomId: newRoomId,
    };
  }
}
