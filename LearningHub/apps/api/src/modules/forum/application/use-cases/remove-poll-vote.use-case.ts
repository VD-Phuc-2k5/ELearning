import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  FORUM_POLL_REPOSITORY,
  IForumPollRepository,
} from '../../domain/repositories/forum-poll.repository.interface';
import {
  FORUM_POST_REPOSITORY,
  IForumPostRepository,
} from '../../domain/repositories/forum-post.repository.interface';
import {
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
} from '../../domain/repositories/forum-member.repository.interface';

@Injectable()
export class RemovePollVoteUseCase {
  constructor(
    @Inject(FORUM_POLL_REPOSITORY)
    private readonly pollRepo: IForumPollRepository,
    @Inject(FORUM_POST_REPOSITORY)
    private readonly postRepo: IForumPostRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
  ) {}

  async execute(
    forumId: string,
    postId: string,
    userId: string,
  ): Promise<void> {
    const post = await this.postRepo.findByIdAndForum(postId, forumId);
    if (!post) throw new NotFoundException('Post not found');

    const member = await this.memberRepo.findByForumAndUser(forumId, userId);
    if (!member) throw new NotFoundException('Not a forum member');

    const poll = await this.pollRepo.findByPost(postId);
    if (!poll) throw new NotFoundException('Poll not found');

    const existingVotes = await this.pollRepo.hasVoted(poll.id, userId);
    if (existingVotes.length === 0) return;

    await this.pollRepo.removeVotes(poll.id, userId);
    for (const vote of existingVotes) {
      await this.pollRepo.incrementOptionVoteCount(vote.optionId, -1);
    }
  }
}
