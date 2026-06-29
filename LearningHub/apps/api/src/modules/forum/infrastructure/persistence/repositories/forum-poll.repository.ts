import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ForumPollEntity } from '../entities/forum-poll.entity';
import { ForumPollOptionEntity } from '../entities/forum-poll-option.entity';
import { ForumPollVoteEntity } from '../entities/forum-poll-vote.entity';
import {
  CreatePollInput,
  IForumPollRepository,
} from '../../../domain/repositories/forum-poll.repository.interface';
import type {
  ForumPollDomain,
  ForumPollOptionDomain,
  ForumPollVoteDomain,
} from '../../../domain/entities/forum-poll.domain';

@Injectable()
export class ForumPollRepository implements IForumPollRepository {
  constructor(
    @InjectRepository(ForumPollEntity)
    private readonly pollRepo: Repository<ForumPollEntity>,
    @InjectRepository(ForumPollOptionEntity)
    private readonly optionRepo: Repository<ForumPollOptionEntity>,
    @InjectRepository(ForumPollVoteEntity)
    private readonly voteRepo: Repository<ForumPollVoteEntity>,
    private readonly dataSource: DataSource,
  ) {}

  private toPoll(e: ForumPollEntity): ForumPollDomain {
    return {
      id: e.id,
      postId: e.postId,
      question: e.question,
      endsAt: e.endsAt,
      isMultipleChoice: e.isMultipleChoice,
    };
  }

  private toOption(e: ForumPollOptionEntity): ForumPollOptionDomain {
    return {
      id: e.id,
      pollId: e.pollId,
      text: e.text,
      voteCount: e.voteCount,
      displayOrder: e.displayOrder,
    };
  }

  async create(input: CreatePollInput): Promise<ForumPollDomain> {
    return this.dataSource.transaction(async (manager) => {
      const poll = manager.create(ForumPollEntity, {
        postId: input.postId,
        question: input.question,
        endsAt: input.endsAt ?? null,
        isMultipleChoice: input.isMultipleChoice ?? false,
      });
      const savedPoll = await manager.save(ForumPollEntity, poll);
      const options = input.options.map((o, i) =>
        manager.create(ForumPollOptionEntity, {
          pollId: savedPoll.id,
          text: o.text,
          displayOrder: i,
        }),
      );
      await manager.save(ForumPollOptionEntity, options);
      return this.toPoll(savedPoll);
    });
  }

  async findByPost(postId: string): Promise<ForumPollDomain | null> {
    const e = await this.pollRepo.findOne({ where: { postId } });
    return e ? this.toPoll(e) : null;
  }

  async findOptions(pollId: string): Promise<ForumPollOptionDomain[]> {
    const options = await this.optionRepo.find({
      where: { pollId },
      order: { displayOrder: 'ASC' },
    });
    return options.map(this.toOption);
  }

  async addVote(
    pollId: string,
    optionId: string,
    userId: string,
  ): Promise<ForumPollVoteDomain> {
    const vote = this.voteRepo.create({ pollId, optionId, userId });
    await this.voteRepo.save(vote);
    return { pollId, optionId, userId };
  }

  async removeVotes(pollId: string, userId: string): Promise<number> {
    const result = await this.voteRepo.delete({ pollId, userId });
    return result.affected ?? 0;
  }

  async hasVoted(
    pollId: string,
    userId: string,
  ): Promise<ForumPollVoteDomain[]> {
    const votes = await this.voteRepo.find({ where: { pollId, userId } });
    return votes.map((v) => ({
      pollId: v.pollId,
      optionId: v.optionId,
      userId: v.userId,
    }));
  }

  async incrementOptionVoteCount(
    optionId: string,
    delta: number,
  ): Promise<void> {
    await this.optionRepo.increment({ id: optionId }, 'voteCount', delta);
  }

  async markExpiredEndsAt(): Promise<string[]> {
    const polls = await this.pollRepo
      .createQueryBuilder('p')
      .where('p.endsAt IS NOT NULL AND p.endsAt < :now', { now: new Date() })
      .getMany();
    return polls.map((p) => p.id);
  }
}
