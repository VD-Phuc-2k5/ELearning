import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
} from '../../domain/repositories/forum-member.repository.interface';
import {
  FORUM_REPOSITORY,
  IForumRepository,
} from '../../domain/repositories/forum.repository.interface';

@Injectable()
export class RemoveMemberUseCase {
  constructor(
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
  ) {}

  async execute(
    forumId: string,
    targetUserId: string,
    actorUserId: string,
  ): Promise<void> {
    const actor = await this.memberRepo.findByForumAndUser(
      forumId,
      actorUserId,
    );
    if (!actor) throw new ForbiddenException('Not a member of this forum');
    const target = await this.memberRepo.findByForumAndUser(
      forumId,
      targetUserId,
    );
    if (!target) throw new NotFoundException('Member not found');
    if (target.role === 'owner') {
      throw new ForbiddenException('Cannot remove the forum owner');
    }
    const actorCanRemove =
      actor.role === 'owner' ||
      (actor.role === 'moderator' && target.role === 'member');
    if (!actorCanRemove && actorUserId !== targetUserId) {
      throw new ForbiddenException(
        'Insufficient permissions to remove this member',
      );
    }
    await this.memberRepo.deleteByForumAndUser(forumId, targetUserId);
    await this.forumRepo.incrementMemberCount(forumId, -1);
  }
}
