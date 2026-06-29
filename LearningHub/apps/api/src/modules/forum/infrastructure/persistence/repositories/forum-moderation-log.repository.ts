import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumModerationLogEntity } from '../entities/forum-moderation-log.entity';
import {
  CreateModerationLogInput,
  IForumModerationLogRepository,
} from '../../../domain/repositories/forum-report.repository.interface';
import type { ForumModerationLogDomain } from '../../../domain/entities/forum-report.domain';

@Injectable()
export class ForumModerationLogRepository
  implements IForumModerationLogRepository
{
  constructor(
    @InjectRepository(ForumModerationLogEntity)
    private readonly repo: Repository<ForumModerationLogEntity>,
  ) {}

  private toDomain(e: ForumModerationLogEntity): ForumModerationLogDomain {
    return {
      id: e.id,
      moderatorId: e.moderatorId,
      action: e.action,
      targetType: e.targetType,
      targetId: e.targetId,
      reasonCode: e.reasonCode,
      reasonText: e.reasonText,
      forumId: e.forumId,
      createdAt: e.createdAt,
    };
  }

  async create(
    input: CreateModerationLogInput,
  ): Promise<ForumModerationLogDomain> {
    const entity = this.repo.create({
      moderatorId: input.moderatorId,
      action: input.action,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      reasonCode: input.reasonCode ?? null,
      reasonText: input.reasonText ?? null,
      forumId: input.forumId ?? null,
    });
    return this.toDomain(await this.repo.save(entity));
  }

  async findByForum(
    forumId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: ForumModerationLogDomain[]; total: number }> {
    const [entities, total] = await this.repo.findAndCount({
      where: { forumId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data: entities.map(this.toDomain), total };
  }
}
