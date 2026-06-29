import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { JoinForumUseCase } from '../../application/use-cases/join-forum.use-case';
import { LeaveForumUseCase } from '../../application/use-cases/leave-forum.use-case';
import { GetForumMembersUseCase } from '../../application/use-cases/get-forum-members.use-case';
import { UpdateMemberRoleUseCase } from '../../application/use-cases/update-member-role.use-case';
import { RemoveMemberUseCase } from '../../application/use-cases/remove-member.use-case';
import { GetJoinRequestsUseCase } from '../../application/use-cases/get-join-requests.use-case';
import { ApproveJoinRequestUseCase } from '../../application/use-cases/approve-join-request.use-case';
import { RejectJoinRequestUseCase } from '../../application/use-cases/reject-join-request.use-case';
import { CreateInviteUseCase } from '../../application/use-cases/create-invite.use-case';
import { GetInvitesUseCase } from '../../application/use-cases/get-invites.use-case';
import { RevokeInviteUseCase } from '../../application/use-cases/revoke-invite.use-case';
import { AcceptInviteUseCase } from '../../application/use-cases/accept-invite.use-case';
import {
  CreateInviteDto,
  CreateJoinRequestDto,
  UpdateMemberRoleDto,
} from '../dto/forum.request.dto';
import { AuthReq } from '../types';

@ApiTags('Forum Membership')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller()
export class ForumMembershipController {
  constructor(
    private readonly joinForumUseCase: JoinForumUseCase,
    private readonly leaveForumUseCase: LeaveForumUseCase,
    private readonly getForumMembersUseCase: GetForumMembersUseCase,
    private readonly updateMemberRoleUseCase: UpdateMemberRoleUseCase,
    private readonly removeMemberUseCase: RemoveMemberUseCase,
    private readonly getJoinRequestsUseCase: GetJoinRequestsUseCase,
    private readonly approveJoinRequestUseCase: ApproveJoinRequestUseCase,
    private readonly rejectJoinRequestUseCase: RejectJoinRequestUseCase,
    private readonly createInviteUseCase: CreateInviteUseCase,
    private readonly getInvitesUseCase: GetInvitesUseCase,
    private readonly revokeInviteUseCase: RevokeInviteUseCase,
    private readonly acceptInviteUseCase: AcceptInviteUseCase,
  ) {}

  @Post('forums/:id/join')
  @ApiOperation({ summary: 'Tham gia diễn đàn hoặc tạo yêu cầu tham gia' })
  join(
    @Param('id') id: string,
    @Body() dto: CreateJoinRequestDto,
    @Request() req: AuthReq,
  ) {
    return this.joinForumUseCase.execute(id, req.user.id, dto.message);
  }

  @Delete('forums/:id/leave')
  @ApiOperation({ summary: 'Rời khỏi diễn đàn (không áp dụng cho owner)' })
  leave(@Param('id') id: string, @Request() req: AuthReq) {
    return this.leaveForumUseCase.execute(id, req.user.id);
  }

  @Get('forums/:id/members')
  @ApiOperation({ summary: 'Danh sách thành viên' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false })
  members(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: 'owner' | 'moderator' | 'member',
  ) {
    return this.getForumMembersUseCase.execute(id, page, limit, role);
  }

  @Patch('forums/:id/members/:userId/role')
  @ApiOperation({ summary: 'Thay đổi vai trò thành viên (chỉ owner)' })
  updateRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
    @Request() req: AuthReq,
  ) {
    return this.updateMemberRoleUseCase.execute(
      id,
      userId,
      dto.role as 'owner' | 'moderator' | 'member',
      req.user.id,
    );
  }

  @Delete('forums/:id/members/:userId')
  @ApiOperation({ summary: 'Xóa thành viên khỏi diễn đàn' })
  removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req: AuthReq,
  ) {
    return this.removeMemberUseCase.execute(id, userId, req.user.id);
  }

  @Get('forums/:id/join-requests')
  @ApiOperation({ summary: 'Danh sách yêu cầu tham gia' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  joinRequests(
    @Param('id') id: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.getJoinRequestsUseCase.execute(id, status, page, limit);
  }

  @Patch('forums/:id/join-requests/:reqId/approve')
  @ApiOperation({ summary: 'Phê duyệt yêu cầu tham gia' })
  approve(
    @Param('id') id: string,
    @Param('reqId') reqId: string,
    @Request() req: AuthReq,
  ) {
    return this.approveJoinRequestUseCase.execute(id, reqId, req.user.id);
  }

  @Patch('forums/:id/join-requests/:reqId/reject')
  @ApiOperation({ summary: 'Từ chối yêu cầu tham gia' })
  reject(
    @Param('id') id: string,
    @Param('reqId') reqId: string,
    @Request() req: AuthReq,
  ) {
    return this.rejectJoinRequestUseCase.execute(id, reqId, req.user.id);
  }

  @Post('forums/:id/invites')
  @ApiOperation({ summary: 'Tạo lời mời tham gia' })
  createInvite(
    @Param('id') id: string,
    @Body() dto: CreateInviteDto,
    @Request() req: AuthReq,
  ) {
    return this.createInviteUseCase.execute(id, req.user.id, dto.inviteeId);
  }

  @Get('forums/:id/invites')
  @ApiOperation({ summary: 'Danh sách lời mời của diễn đàn' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  invites(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.getInvitesUseCase.execute(id, page, limit);
  }

  @Delete('forums/:id/invites/:inviteId')
  @ApiOperation({ summary: 'Thu hồi lời mời' })
  revokeInvite(@Param('id') id: string, @Param('inviteId') inviteId: string) {
    return this.revokeInviteUseCase.execute(id, inviteId);
  }

  @Post('invites/:token/accept')
  @ApiOperation({ summary: 'Chấp nhận lời mời theo token' })
  acceptInvite(@Param('token') token: string, @Request() req: AuthReq) {
    return this.acceptInviteUseCase.execute(token, req.user.id);
  }
}
