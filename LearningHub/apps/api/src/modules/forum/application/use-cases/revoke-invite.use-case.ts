import {
  Inject,
  Injectable,
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

@Injectable()
export class RevokeInviteUseCase {
  constructor(
    @Inject(FORUM_INVITE_REPOSITORY)
    private readonly inviteRepo: IForumInviteRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
  ) {}

  async execute(
    forumId: string,
    inviteId: string,
    userId: string,
  ): Promise<void> {
    const member = await this.memberRepo.findByForumAndUser(forumId, userId);
    if (!member) {
      throw new ForbiddenException('You must be a member to revoke invites');
    }

    const invite = await this.inviteRepo.findById(inviteId);
    if (!invite) throw new NotFoundException('Invite not found');

    const isOwnerOrMod = member.role === 'owner' || member.role === 'moderator';
    const isCreator = invite.inviterId === userId;

    if (!isOwnerOrMod && !isCreator) {
      throw new ForbiddenException('You can only close your own invites');
    }

    await this.inviteRepo.updateStatus(invite.id, 'closed');
  }
}
