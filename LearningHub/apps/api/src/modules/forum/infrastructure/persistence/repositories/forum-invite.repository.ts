import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumInviteEntity } from '../entities/forum-invite.entity';
import {
  CreateInviteInput,
  IForumInviteRepository,
} from '../../../domain/repositories/forum-invite.repository.interface';
import type {
  ForumInviteDomain,
  ForumInviteStatus,
} from '../../../domain/entities/forum-invite.domain';

@Injectable()
export class ForumInviteRepository implements IForumInviteRepository {
  constructor(
    @InjectRepository(ForumInviteEntity)
    private readonly repo: Repository<ForumInviteEntity>,
  ) {}

  private toDomain(e: ForumInviteEntity): ForumInviteDomain {
    return {
      id: e.id,
      forumId: e.forumId,
      inviterId: e.inviterId,
      inviteeId: e.inviteeId,
      token: e.token,
      status: e.status as ForumInviteStatus,
      expiresAt: e.expiresAt,
    };
  }

  async create(input: CreateInviteInput): Promise<ForumInviteDomain> {
    const entity = this.repo.create({
      forumId: input.forumId,
      inviterId: input.inviterId,
      inviteeId: input.inviteeId ?? null,
      token: input.token,
      expiresAt: input.expiresAt,
      status: 'pending',
    });
    return this.toDomain(await this.repo.save(entity));
  }

  async findByToken(token: string): Promise<ForumInviteDomain | null> {
    const e = await this.repo.findOne({ where: { token } });
    return e ? this.toDomain(e) : null;
  }

  async findByForum(
    forumId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: ForumInviteDomain[]; total: number }> {
    const [entities, total] = await this.repo.findAndCount({
      where: { forumId },
      skip: (page - 1) * limit,
      take: limit,
      order: { expiresAt: 'DESC' },
    });
    return { data: entities.map(this.toDomain.bind(this)), total };
  }

  async updateStatus(id: string, status: string): Promise<ForumInviteDomain> {
    await this.repo.update(id, { status });
    const updated = await this.repo.findOneOrFail({ where: { id } });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async markExpired(): Promise<number> {
    const result = await this.repo
      .createQueryBuilder()
      .update()
      .set({ status: 'expired' })
      .where('status = :s AND expiresAt < :now', {
        s: 'pending',
        now: new Date(),
      })
      .execute();
    return result.affected ?? 0;
  }
}
