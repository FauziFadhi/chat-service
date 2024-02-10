import { PrivateRoomService } from '@chat/services/room.service';
import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from 'src/account/services/account.service';
import { IAppsUserPayload, User } from 'src/shared/decorators/user.decorator';
import { TokenGuard } from 'src/shared/guards/auth.guard';

@UseGuards(TokenGuard)
@Controller({ path: 'rooms', version: '1' })
export class RoomController {
  constructor(
    private readonly roomService: PrivateRoomService,
    private readonly accountService: AccountService,
  ) {}

  @Get()
  async getRoom(
    @Query() query: { peerId: string },
    @User() user: IAppsUserPayload,
  ) {
    if (!query.peerId) {
      throw new BadRequestException('peer not found');
    }

    if (query.peerId === user.userId) {
      throw new BadRequestException('can not create room with yourself');
    }
    const participantIds = [query.peerId, user.userId];

    const peer = await this.accountService.getUserById(query.peerId);

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
      { name: `${query.peerId}-${user.userId}` },
      participantIds,
    );

    return {
      roomId: newRoomId,
    };
  }
}
