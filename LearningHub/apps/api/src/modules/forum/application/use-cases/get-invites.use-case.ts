import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import {
  FORUM_INVITE_REPOSITORY,
  IForumInviteRepository,
} from '../../domain/repositories/forum-invite.repository.interface';
import {
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
} from '../../domain/repositories/forum-member.repository.interface';
import { ForumInviteDomain } from '../../domain/entities/forum-invite.domain';

@Injectable()
export class GetInvitesUseCase {
  constructor(
    @Inject(FORUM_INVITE_REPOSITORY)
    private readonly inviteRepo: IForumInviteRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
  ) {}

  async execute(
    forumId: string,
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<{ data: ForumInviteDomain[]; total: number }> {
    const member = await this.memberRepo.findByForumAndUser(forumId, userId);
    if (!member) {
      throw new ForbiddenException('You must be a member to view invites');
    }

    if (member.role === 'owner' || member.role === 'moderator') {
      return this.inviteRepo.findByForum(forumId, page, limit);
    }

    return this.inviteRepo.findByForumAndUser(forumId, userId, page, limit);
  }
}
