import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
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
import { ForumInviteDomain } from '../../domain/entities/forum-invite.domain';

const INVITE_EXPIRES_IN_MINUTES = 15;

@Injectable()
export class CreateInviteUseCase {
  constructor(
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
    @Inject(FORUM_INVITE_REPOSITORY)
    private readonly inviteRepo: IForumInviteRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
  ) {}

  async execute(
    forumId: string,
    inviterId: string,
    inviteeId?: string,
  ): Promise<ForumInviteDomain> {
    const forum = await this.forumRepo.findById(forumId);
    if (!forum) throw new NotFoundException('Forum not found');

    const member = await this.memberRepo.findByForumAndUser(forumId, inviterId);
    if (!member) {
      throw new ForbiddenException('You must be a member to create invites');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + INVITE_EXPIRES_IN_MINUTES * 60000);
    return this.inviteRepo.create({
      forumId,
      inviterId,
      inviteeId,
      token,
      expiresAt,
    });
  }
}
