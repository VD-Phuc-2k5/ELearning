import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumJoinRequestEntity } from '../entities/forum-join-request.entity';
import {
  CreateJoinRequestInput,
  IForumJoinRequestRepository,
} from '../../../domain/repositories/forum-join-request.repository.interface';
import type {
  ForumJoinRequestDomain,
  JoinRequestStatus,
} from '../../../domain/entities/forum-join-request.domain';

@Injectable()
export class ForumJoinRequestRepository implements IForumJoinRequestRepository {
  constructor(
    @InjectRepository(ForumJoinRequestEntity)
    private readonly repo: Repository<ForumJoinRequestEntity>,
  ) {}

  private toDomain(e: ForumJoinRequestEntity): ForumJoinRequestDomain {
    return {
      id: e.id,
      forumId: e.forumId,
      userId: e.userId,
      status: e.status as JoinRequestStatus,
      message: e.message,
      reviewedBy: e.reviewedBy,
      reviewedAt: e.reviewedAt,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }

  async create(input: CreateJoinRequestInput): Promise<ForumJoinRequestDomain> {
    const entity = this.repo.create({
      forumId: input.forumId,
      userId: input.userId,
      message: input.message ?? null,
      status: 'pending',
    });
    return this.toDomain(await this.repo.save(entity));
  }

  async findByForumAndUser(
    forumId: string,
    userId: string,
  ): Promise<ForumJoinRequestDomain | null> {
    const e = await this.repo.findOne({ where: { forumId, userId } });
    return e ? this.toDomain(e) : null;
  }

  async findById(id: string): Promise<ForumJoinRequestDomain | null> {
    const e = await this.repo.findOne({ where: { id } });
    return e ? this.toDomain(e) : null;
  }

  async findByForum(
    forumId: string,
    status?: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: ForumJoinRequestDomain[]; total: number }> {
    const qb = this.repo
      .createQueryBuilder('r')
      .where('r.forumId = :forumId', { forumId });
    if (status) qb.andWhere('r.status = :status', { status });

    const [entities, total] = await qb
      .orderBy('r.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data: entities.map(this.toDomain.bind(this)), total };
  }

  async updateStatus(
    id: string,
    status: string,
    reviewedBy: string,
  ): Promise<ForumJoinRequestDomain> {
    await this.repo.update(id, {
      status,
      reviewedBy,
      reviewedAt: new Date(),
    });
    const updated = await this.repo.findOneOrFail({ where: { id } });
    return this.toDomain(updated);
  }

  async countByForum(forumId: string): Promise<number> {
    return this.repo.count({ where: { forumId, status: 'pending' } });
  }
}
