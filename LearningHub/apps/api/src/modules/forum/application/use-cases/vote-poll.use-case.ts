import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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
export class VotePollUseCase {
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
    optionIds: string[],
    userId: string,
  ): Promise<void> {
    const post = await this.postRepo.findByIdAndForum(postId, forumId);
    if (!post) throw new NotFoundException('Post not found');
    if (post.postType !== 'poll')
      throw new BadRequestException('Post is not a poll');

    const member = await this.memberRepo.findByForumAndUser(forumId, userId);
    if (!member) throw new BadRequestException('Only forum members can vote');

    const poll = await this.pollRepo.findByPost(postId);
    if (!poll) throw new NotFoundException('Poll not found');
    if (poll.endsAt && poll.endsAt < new Date()) {
      throw new BadRequestException('Poll has ended');
    }
    if (optionIds.length === 0) {
      throw new BadRequestException('Must select at least one option');
    }
    if (!poll.isMultipleChoice && optionIds.length > 1) {
      throw new BadRequestException('Poll allows only one choice');
    }

    const validOptions = await this.pollRepo.findOptions(poll.id);
    const validIds = new Set(validOptions.map((o) => o.id));
    for (const id of optionIds) {
      if (!validIds.has(id))
        throw new NotFoundException(`Option ${id} does not exist`);
    }

    const previousVotes = await this.pollRepo.hasVoted(poll.id, userId);
    if (previousVotes.length > 0) {
      await this.pollRepo.removeVotes(poll.id, userId);
    }
    for (const vote of previousVotes) {
      await this.pollRepo.incrementOptionVoteCount(vote.optionId, -1);
    }
    for (const id of optionIds) {
      await this.pollRepo.addVote(poll.id, id, userId);
      await this.pollRepo.incrementOptionVoteCount(id, 1);
    }
  }
}
