import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  FORUM_POST_REPOSITORY,
  IForumPostRepository,
} from '../../domain/repositories/forum-post.repository.interface';
import {
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
} from '../../domain/repositories/forum-member.repository.interface';
import type { ForumPostDomain } from '../../domain/entities/forum-post.domain';

@Injectable()
export class PinPostUseCase {
  constructor(
    @Inject(FORUM_POST_REPOSITORY)
    private readonly postRepo: IForumPostRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
  ) {}

  async execute(
    forumId: string,
    postId: string,
    userId: string,
    pin: boolean,
  ): Promise<ForumPostDomain> {
    const post = await this.postRepo.findByIdAndForum(postId, forumId);
    if (!post) throw new NotFoundException('Post not found');

    const member = await this.memberRepo.findByForumAndUser(forumId, userId);
    if (!member || (member.role !== 'moderator' && member.role !== 'owner')) {
      throw new ForbiddenException('Only moderators or owners can pin posts');
    }
    return this.postRepo.setPinned(postId, pin);
  }
}
