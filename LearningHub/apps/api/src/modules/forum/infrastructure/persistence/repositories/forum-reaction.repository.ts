import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumReactionEntity } from '../entities/forum-reaction.entity';
import { IForumReactionRepository } from '../../../domain/repositories/forum-reaction.repository.interface';
import type {
  ForumReactionDomain,
  ReactionTargetType,
} from '../../../domain/entities/forum-reaction.domain';

@Injectable()
export class ForumReactionRepository implements IForumReactionRepository {
  constructor(
    @InjectRepository(ForumReactionEntity)
    private readonly repo: Repository<ForumReactionEntity>,
  ) {}

  private toDomain(e: ForumReactionEntity): ForumReactionDomain {
    return {
      id: e.id,
      targetType: e.targetType as ReactionTargetType,
      targetId: e.targetId,
      userId: e.userId,
      emoji: e.emoji,
      createdAt: e.createdAt,
    };
  }

  async findByTargetAndUser(
    targetType: ReactionTargetType,
    targetId: string,
    userId: string,
  ): Promise<ForumReactionDomain | null> {
    const e = await this.repo.findOne({
      where: { targetType, targetId, userId },
    });
    return e ? this.toDomain(e) : null;
  }

  async create(
    targetType: ReactionTargetType,
    targetId: string,
    userId: string,
    emoji: string,
  ): Promise<ForumReactionDomain> {
    const entity = this.repo.create({
      targetType,
      targetId,
      userId,
      emoji,
    });
    return this.toDomain(await this.repo.save(entity));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async deleteByUser(
    targetType: ReactionTargetType,
    targetId: string,
    userId: string,
  ): Promise<number> {
    const result = await this.repo.delete({ targetType, targetId, userId });
    return result.affected ?? 0;
  }

  async findByTarget(
    targetType: ReactionTargetType,
    targetId: string,
  ): Promise<ForumReactionDomain[]> {
    const entities = await this.repo.find({
      where: { targetType, targetId },
    });
    return entities.map(this.toDomain);
  }
}
