import type {
  ForumPollDomain,
  ForumPollOptionDomain,
  ForumPollVoteDomain,
} from '../entities/forum-poll.domain';

export interface CreatePollInput {
  postId: string;
  question: string;
  endsAt?: Date;
  isMultipleChoice?: boolean;
  options: Array<{ text: string }>;
}

export interface IForumPollRepository {
  create(input: CreatePollInput): Promise<ForumPollDomain>;
  findByPost(postId: string): Promise<ForumPollDomain | null>;
  findOptions(pollId: string): Promise<ForumPollOptionDomain[]>;
  addVote(
    pollId: string,
    optionId: string,
    userId: string,
  ): Promise<ForumPollVoteDomain>;
  removeVotes(pollId: string, userId: string): Promise<number>;
  hasVoted(pollId: string, userId: string): Promise<ForumPollVoteDomain[]>;
  incrementOptionVoteCount(optionId: string, delta: number): Promise<void>;
  markExpiredEndsAt(): Promise<string[]>;
}

export const FORUM_POLL_REPOSITORY = Symbol('IForumPollRepository');
