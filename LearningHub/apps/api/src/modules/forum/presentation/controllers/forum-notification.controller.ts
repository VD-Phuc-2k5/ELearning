import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  CountUnreadNotificationsUseCase,
  DeleteReadNotificationsUseCase,
  GetMyNotificationsUseCase,
  MarkAllNotificationsReadUseCase,
  MarkNotificationReadUseCase,
} from '../../application/use-cases/forum-notification.use-case';
import { AuthReq } from '../types';

@ApiTags('Forum Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller()
export class ForumNotificationController {
  constructor(
    private readonly getMyNotificationsUseCase: GetMyNotificationsUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
    private readonly markAllNotificationsReadUseCase: MarkAllNotificationsReadUseCase,
    private readonly countUnreadNotificationsUseCase: CountUnreadNotificationsUseCase,
    private readonly deleteReadNotificationsUseCase: DeleteReadNotificationsUseCase,
  ) {}

  @Get('me/forum-notifications')
  @ApiOperation({ summary: 'Danh sách thông báo của tôi' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  list(
    @Request() req: AuthReq,
    @Query('unreadOnly') unreadOnly?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.getMyNotificationsUseCase.execute(
      req.user.id,
      unreadOnly,
      page,
      limit,
    );
  }

  @Get('me/forum-notifications/unread-count')
  @ApiOperation({ summary: 'Số thông báo chưa đọc' })
  unreadCount(@Request() req: AuthReq) {
    return this.countUnreadNotificationsUseCase.execute(req.user.id);
  }

  @Patch('me/forum-notifications/:id/read')
  @ApiOperation({ summary: 'Đánh dấu đã đọc 1 thông báo' })
  markRead(@Param('id') id: string, @Request() req: AuthReq) {
    return this.markNotificationReadUseCase.execute(id, req.user.id);
  }

  @Patch('me/forum-notifications/read-all')
  @ApiOperation({ summary: 'Đánh dấu đã đọc toàn bộ' })
  markAllRead(@Request() req: AuthReq) {
    return this.markAllNotificationsReadUseCase.execute(req.user.id);
  }

  @Delete('me/forum-notifications/read')
  @ApiOperation({ summary: 'Xoá toàn bộ thông báo đã đọc' })
  deleteRead(@Request() req: AuthReq) {
    return this.deleteReadNotificationsUseCase.execute(req.user.id);
  }
}
