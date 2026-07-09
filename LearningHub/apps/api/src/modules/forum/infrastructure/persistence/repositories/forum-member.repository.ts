import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumMemberEntity } from '../entities/forum-member.entity';
import {
  CreateMemberInput,
  IForumMemberRepository,
  MemberListPage,
  MemberSearchResult,
} from '../../../domain/repositories/forum-member.repository.interface';
import type { ForumMemberRole } from '../../../domain/entities/forum.domain';
import type { ForumMemberDomain } from '../../../domain/entities/forum-member.domain';
import { UserEntity } from '../../../../auth/infrastructure/persistence/entities/user.entity';

@Injectable()
export class ForumMemberRepository implements IForumMemberRepository {
  constructor(
    @InjectRepository(ForumMemberEntity)
    private readonly repo: Repository<ForumMemberEntity>,
  ) {}

  private toDomain(e: ForumMemberEntity): ForumMemberDomain {
    return {
      id: e.id,
      forumId: e.forumId,
      userId: e.userId,
      role: e.role as ForumMemberRole,
      joinedAt: e.joinedAt,
    };
  }

  async create(input: CreateMemberInput): Promise<ForumMemberDomain> {
    const entity = this.repo.create({
      forumId: input.forumId,
      userId: input.userId,
      role: input.role ?? 'member',
    });
    return this.toDomain(await this.repo.save(entity));
  }

  async findById(id: string): Promise<ForumMemberDomain | null> {
    const e = await this.repo.findOne({ where: { id } });
    return e ? this.toDomain(e) : null;
  }

  async findByForumAndUser(
    forumId: string,
    userId: string,
  ): Promise<ForumMemberDomain | null> {
    const e = await this.repo.findOne({ where: { forumId, userId } });
    return e ? this.toDomain(e) : null;
  }

  async findAll(
    forumId: string,
    page = 1,
    limit = 20,
    role?: ForumMemberRole,
  ): Promise<MemberListPage> {
    const qb = this.repo.createQueryBuilder('m').where('m.forumId = :forumId', {
      forumId,
    });
    if (role) qb.andWhere('m.role = :role', { role });

    const [entities, total] = await qb
      .orderBy('m.joinedAt', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: entities.map(this.toDomain.bind(this)), total };
  }

  async searchByName(
    forumId: string,
    keyword: string,
    limit = 5,
  ): Promise<MemberSearchResult[]> {
    const rows = await this.repo
      .createQueryBuilder('m')
      .leftJoin(UserEntity, 'u', 'u.id = m.userId')
      .select(['m.userId', 'u.username', 'u.avatarUrl'])
      .where('m.forumId = :forumId', { forumId })
      .andWhere('u.username ILIKE :kw', { kw: `%${keyword}%` })
      .orderBy('u.username', 'ASC')
      .limit(limit)
      .getRawMany();
    return rows.map((row: Record<string, unknown>) => ({
      userId: (row.m_user_id ?? row.userId) as string,
      username: (row.u_username ?? row.username) as string,
      avatarUrl: (row.u_avatarUrl ?? row.avatarUrl) as string | null,
    }));
  }

  async updateRole(
    id: string,
    role: ForumMemberRole,
  ): Promise<ForumMemberDomain> {
    await this.repo.update(id, { role });
    const updated = await this.repo.findOneOrFail({ where: { id } });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async deleteByForumAndUser(forumId: string, userId: string): Promise<void> {
    await this.repo.delete({ forumId, userId });
  }

  async countByForum(forumId: string): Promise<number> {
    return this.repo.count({ where: { forumId } });
  }
}
