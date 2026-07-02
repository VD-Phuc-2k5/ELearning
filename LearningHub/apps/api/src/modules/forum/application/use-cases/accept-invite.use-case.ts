import {
  Inject,
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  FORUM_INVITE_REPOSITORY,
  IForumInviteRepository,
} from '../../domain/repositories/forum-invite.repository.interface';
import {
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
} from '../../domain/repositories/forum-member.repository.interface';
import {
  FORUM_REPOSITORY,
  IForumRepository,
} from '../../domain/repositories/forum.repository.interface';
import { ForumMemberDomain } from '../../domain/entities/forum-member.domain';

export interface AcceptInviteResult {
  member: ForumMemberDomain;
  forumId: string;
  forumSlug: string;
}

@Injectable()
export class AcceptInviteUseCase {
  constructor(
    @Inject(FORUM_INVITE_REPOSITORY)
    private readonly inviteRepo: IForumInviteRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
  ) {}

  async execute(token: string, userId: string): Promise<AcceptInviteResult> {
    const invite = await this.inviteRepo.findByToken(token);
    if (!invite) throw new NotFoundException('Invite not found');
    if (invite.status === 'closed') {
      throw new BadRequestException('Invite has been closed');
    }
    if (invite.status === 'expired') {
      throw new BadRequestException('Invite has expired');
    }
    if (invite.expiresAt < new Date()) {
      await this.inviteRepo.updateStatus(invite.id, 'expired');
      throw new BadRequestException('Invite has expired');
    }
    if (invite.inviteeId && invite.inviteeId !== userId) {
      throw new ForbiddenException('Invite was not issued to you');
    }

    const existing = await this.memberRepo.findByForumAndUser(
      invite.forumId,
      userId,
    );
    if (existing) throw new ConflictException('Already a member');

    const forum = await this.forumRepo.findById(invite.forumId);
    const member = await this.memberRepo.create({
      forumId: invite.forumId,
      userId,
      role: 'member',
    });
    await this.forumRepo.incrementMemberCount(invite.forumId, 1);
    await this.inviteRepo.incrementAcceptedCount(invite.id);
    return {
      member,
      forumId: invite.forumId,
      forumSlug: forum?.slug ?? invite.forumId,
    };
  }
}
