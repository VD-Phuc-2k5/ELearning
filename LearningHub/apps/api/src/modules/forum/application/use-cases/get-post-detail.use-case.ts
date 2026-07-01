import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  FORUM_POST_REPOSITORY,
  IForumPostRepository,
} from '../../domain/repositories/forum-post.repository.interface';
import {
  FORUM_POLL_REPOSITORY,
  IForumPollRepository,
} from '../../domain/repositories/forum-poll.repository.interface';
import type {
  ForumPollDomain,
  ForumPollOptionDomain,
} from '../../domain/entities/forum-poll.domain';
import type { ForumPostDomain } from '../../domain/entities/forum-post.domain';

export interface PostDetailResult {
  post: ForumPostDomain;
  poll: { poll: ForumPollDomain; options: ForumPollOptionDomain[] } | null;
}

@Injectable()
export class GetPostDetailUseCase {
  constructor(
    @Inject(FORUM_POST_REPOSITORY)
    private readonly postRepo: IForumPostRepository,
    @Inject(FORUM_POLL_REPOSITORY)
    private readonly pollRepo: IForumPollRepository,
  ) {}

  async execute(
    forumId: string,
    postId: string,
    incrementView = true,
  ): Promise<PostDetailResult> {
    const post = await this.postRepo.findByIdAndForum(postId, forumId);
    if (!post) throw new NotFoundException('Post not found');

    if (incrementView) {
      this.postRepo.incrementViewCount(postId, 1).catch(() => undefined);
    }

    const poll = await this.pollRepo.findByPost(postId);
    const pollDetail =
      poll != null
        ? {
            poll,
            options: await this.pollRepo.findOptions(poll.id),
          }
        : null;

    return { post, poll: pollDetail };
  }
}
