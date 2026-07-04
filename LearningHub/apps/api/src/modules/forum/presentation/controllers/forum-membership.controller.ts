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

import { CreateInviteUseCase } from '../../application/use-cases/create-invite.use-case';
import { GetInvitesUseCase } from '../../application/use-cases/get-invites.use-case';
import { RevokeInviteUseCase } from '../../application/use-cases/revoke-invite.use-case';
import { AcceptInviteUseCase } from '../../application/use-cases/accept-invite.use-case';
import { SearchMembersUseCase } from '../../application/use-cases/search-members.use-case';
import { CreateInviteDto } from '../dto/create-invite.dto';
import { UpdateMemberRoleDto } from '../dto/update-member-role.dto';
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

    private readonly createInviteUseCase: CreateInviteUseCase,
    private readonly getInvitesUseCase: GetInvitesUseCase,
    private readonly revokeInviteUseCase: RevokeInviteUseCase,
    private readonly acceptInviteUseCase: AcceptInviteUseCase,
    private readonly searchMembersUseCase: SearchMembersUseCase,
  ) {}

  @Get('forums/:id/members/search')
  @ApiOperation({ summary: 'Tìm kiếm thành viên để @mention' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  searchMembers(
    @Param('id') id: string,
    @Query('q') q: string,
    @Query('limit') limit?: number,
  ) {
    return this.searchMembersUseCase.execute(id, q, limit);
  }

  @Post('forums/:id/join')
  @ApiOperation({ summary: 'Tham gia diễn đàn hoặc tạo yêu cầu tham gia' })
  join(
    @Param('id') id: string,
    @Body() dto: { message?: string },
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
    @Request() req: AuthReq,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.getInvitesUseCase.execute(id, req.user.id, page, limit);
  }

  @Delete('forums/:id/invites/:inviteId')
  @ApiOperation({ summary: 'Thu hồi lời mời' })
  revokeInvite(
    @Param('id') id: string,
    @Param('inviteId') inviteId: string,
    @Request() req: AuthReq,
  ) {
    return this.revokeInviteUseCase.execute(id, inviteId, req.user.id);
  }

  @Post('invites/:token/accept')
  @ApiOperation({ summary: 'Chấp nhận lời mời theo token' })
  acceptInvite(@Param('token') token: string, @Request() req: AuthReq) {
    return this.acceptInviteUseCase.execute(token, req.user.id);
  }
}
