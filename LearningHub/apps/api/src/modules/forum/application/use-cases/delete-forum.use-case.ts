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
export class DeleteForumUseCase {
  constructor(
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const forum = await this.forumRepo.findById(id);
    if (!forum) throw new NotFoundException('Forum not found');

    const member = await this.memberRepo.findByForumAndUser(id, userId);
    if (!member || member.role !== 'owner') {
      throw new ForbiddenException('Only the owner can delete this forum');
    }
    await this.forumRepo.delete(id);
  }
}
