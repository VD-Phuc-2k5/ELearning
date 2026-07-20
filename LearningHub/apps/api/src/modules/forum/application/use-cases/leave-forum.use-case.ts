import {
  Inject,
  Injectable,
  BadRequestException,
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
export class LeaveForumUseCase {
  constructor(
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
  ) {}

  async execute(forumId: string, userId: string): Promise<void> {
    const member = await this.memberRepo.findByForumAndUser(forumId, userId);
    if (!member) throw new NotFoundException('Not a member of this forum');
    if (member.role === 'owner') {
      throw new BadRequestException(
        'Owner cannot leave — transfer ownership or delete the forum',
      );
    }
    await this.memberRepo.deleteByForumAndUser(forumId, userId);
    await this.forumRepo.incrementMemberCount(forumId, -1);
  }
}
