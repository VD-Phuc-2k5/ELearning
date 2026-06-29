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
  type UpdateForumInput,
} from '../../domain/repositories/forum.repository.interface';
import type { ForumDomain } from '../../domain/entities/forum.domain';

@Injectable()
export class UpdateForumUseCase {
  constructor(
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
  ) {}

  async execute(
    id: string,
    input: UpdateForumInput,
    userId: string,
  ): Promise<ForumDomain> {
    const forum = await this.forumRepo.findById(id);
    if (!forum) throw new NotFoundException('Forum not found');

    const member = await this.memberRepo.findByForumAndUser(id, userId);
    if (!member || member.role !== 'owner') {
      throw new ForbiddenException('Only the owner can update this forum');
    }
    return this.forumRepo.update(id, input);
  }
}
