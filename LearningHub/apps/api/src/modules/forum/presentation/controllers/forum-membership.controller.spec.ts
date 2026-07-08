import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForumMembershipController } from './forum-membership.controller';
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

const mockReq = { user: { id: 'user-1' }, headers: {} };

// ponytail: single factory keeps provider list DRY
const mockUseCase = () => ({ execute: jest.fn() });

describe('ForumMembershipController', () => {
  let controller: ForumMembershipController;
  let joinUseCase: { execute: jest.Mock };
  let leaveUseCase: { execute: jest.Mock };
  let membersUseCase: { execute: jest.Mock };
  let updateRoleUseCase: { execute: jest.Mock };
  let removeMemberUseCase: { execute: jest.Mock };
  let createInviteUseCase: { execute: jest.Mock };
  let getInvitesUseCase: { execute: jest.Mock };
  let revokeInviteUseCase: { execute: jest.Mock };
  let acceptInviteUseCase: { execute: jest.Mock };
  let searchMembersUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumMembershipController],
      providers: [
        { provide: JoinForumUseCase, useValue: mockUseCase() },
        { provide: LeaveForumUseCase, useValue: mockUseCase() },
        { provide: GetForumMembersUseCase, useValue: mockUseCase() },
        { provide: UpdateMemberRoleUseCase, useValue: mockUseCase() },
        { provide: RemoveMemberUseCase, useValue: mockUseCase() },
        { provide: CreateInviteUseCase, useValue: mockUseCase() },
        { provide: GetInvitesUseCase, useValue: mockUseCase() },
        { provide: RevokeInviteUseCase, useValue: mockUseCase() },
        { provide: AcceptInviteUseCase, useValue: mockUseCase() },
        { provide: SearchMembersUseCase, useValue: mockUseCase() },
      ],
    }).compile();

    controller = module.get<ForumMembershipController>(
      ForumMembershipController,
    );
    joinUseCase = module.get(JoinForumUseCase);
    leaveUseCase = module.get(LeaveForumUseCase);
    membersUseCase = module.get(GetForumMembersUseCase);
    updateRoleUseCase = module.get(UpdateMemberRoleUseCase);
    removeMemberUseCase = module.get(RemoveMemberUseCase);
    createInviteUseCase = module.get(CreateInviteUseCase);
    getInvitesUseCase = module.get(GetInvitesUseCase);
    revokeInviteUseCase = module.get(RevokeInviteUseCase);
    acceptInviteUseCase = module.get(AcceptInviteUseCase);
    searchMembersUseCase = module.get(SearchMembersUseCase);
  });

  describe('GET /forums/:id/members/search', () => {
    it('should return matching members', async () => {
      searchMembersUseCase.execute.mockResolvedValue([{ id: 'user-2' }]);
      const result = await controller.searchMembers('forum-1', 'joh', 5);
      expect(result).toEqual([{ id: 'user-2' }]);
      expect(searchMembersUseCase.execute).toHaveBeenCalledWith(
        'forum-1',
        'joh',
        5,
      );
    });
  });

  describe('POST /forums/:id/join', () => {
    it('should join forum', async () => {
      joinUseCase.execute.mockResolvedValue({ joined: true });
      const result = await controller.join('forum-1', {}, mockReq as any);
      expect(result).toEqual({ joined: true });
      expect(joinUseCase.execute).toHaveBeenCalledWith(
        'forum-1',
        'user-1',
        undefined,
      );
    });
  });

  describe('DELETE /forums/:id/leave', () => {
    it('should leave forum', async () => {
      leaveUseCase.execute.mockResolvedValue({ left: true });
      const result = await controller.leave('forum-1', mockReq as any);
      expect(result).toEqual({ left: true });
    });

    it('should throw ForbiddenException when owner tries to leave', async () => {
      leaveUseCase.execute.mockRejectedValue(new ForbiddenException());
      await expect(controller.leave('forum-1', mockReq as any)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('GET /forums/:id/members', () => {
    it('should return member list', async () => {
      membersUseCase.execute.mockResolvedValue([{ id: 'user-1' }]);
      const result = await controller.members('forum-1', 1, 10, undefined);
      expect(result).toEqual([{ id: 'user-1' }]);
    });
  });

  describe('PATCH /forums/:id/members/:userId/role', () => {
    it('should update member role for owner', async () => {
      updateRoleUseCase.execute.mockResolvedValue({ role: 'moderator' });
      const result = await controller.updateRole(
        'forum-1',
        'user-2',
        { role: 'moderator' } as any,
        mockReq as any,
      );
      expect(result).toEqual({ role: 'moderator' });
      expect(updateRoleUseCase.execute).toHaveBeenCalledWith(
        'forum-1',
        'user-2',
        'moderator',
        'user-1',
      );
    });

    it('should throw ForbiddenException when not owner', async () => {
      updateRoleUseCase.execute.mockRejectedValue(new ForbiddenException());
      await expect(
        controller.updateRole(
          'forum-1',
          'user-2',
          { role: 'moderator' } as any,
          mockReq as any,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('DELETE /forums/:id/members/:userId', () => {
    it('should remove member', async () => {
      removeMemberUseCase.execute.mockResolvedValue({ removed: true });
      const result = await controller.removeMember(
        'forum-1',
        'user-2',
        mockReq as any,
      );
      expect(result).toEqual({ removed: true });
    });
  });

  describe('POST /forums/:id/invites', () => {
    it('should create invite', async () => {
      createInviteUseCase.execute.mockResolvedValue({ id: 'invite-1' });
      const result = await controller.createInvite(
        'forum-1',
        { inviteeId: 'user-2' } as any,
        mockReq as any,
      );
      expect(result).toEqual({ id: 'invite-1' });
      expect(createInviteUseCase.execute).toHaveBeenCalledWith(
        'forum-1',
        'user-1',
        'user-2',
      );
    });
  });

  describe('GET /forums/:id/invites', () => {
    it('should return invite list', async () => {
      getInvitesUseCase.execute.mockResolvedValue([{ id: 'invite-1' }]);
      const result = await controller.invites('forum-1', mockReq as any, 1, 10);
      expect(result).toEqual([{ id: 'invite-1' }]);
    });
  });

  describe('DELETE /forums/:id/invites/:inviteId', () => {
    it('should revoke invite', async () => {
      revokeInviteUseCase.execute.mockResolvedValue({ revoked: true });
      const result = await controller.revokeInvite(
        'forum-1',
        'invite-1',
        mockReq as any,
      );
      expect(result).toEqual({ revoked: true });
    });
  });

  describe('POST /invites/:token/accept', () => {
    it('should accept invite', async () => {
      acceptInviteUseCase.execute.mockResolvedValue({ accepted: true });
      const result = await controller.acceptInvite('token-1', mockReq as any);
      expect(result).toEqual({ accepted: true });
    });

    it('should throw NotFoundException for invalid token', async () => {
      acceptInviteUseCase.execute.mockRejectedValue(new NotFoundException());
      await expect(
        controller.acceptInvite('bad-token', mockReq as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
