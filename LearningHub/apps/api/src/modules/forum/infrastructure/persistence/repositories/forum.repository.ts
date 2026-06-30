import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumEntity } from '../entities/forum.entity';
import {
  ForumListPage,
  CreateForumInput,
  GetForumListInput,
  IForumRepository,
  UpdateForumInput,
} from '../../../domain/repositories/forum.repository.interface';
import type { ForumDomain } from '../../../domain/entities/forum.domain';

@Injectable()
export class ForumRepository implements IForumRepository {
  constructor(
    @InjectRepository(ForumEntity)
    private readonly repo: Repository<ForumEntity>,
  ) {}

  private toDomain(e: ForumEntity): ForumDomain {
    return {
      id: e.id,
      name: e.name,
      slug: e.slug,
      description: e.description,
      visibility: e.visibility as ForumDomain['visibility'],
      bannerUrl: e.bannerUrl,
      iconUrl: e.iconUrl,
      memberCount: e.memberCount,
      postCount: e.postCount,
      ownerId: e.ownerId,
      categoryId: e.categoryId,
      isLocked: e.isLocked,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }

  async create(input: CreateForumInput): Promise<ForumDomain> {
    const entity = this.repo.create({
      name: input.name,
      slug: slugify(input.name),
      description: input.description ?? null,
      visibility: input.visibility ?? 'public',
      bannerUrl: input.bannerUrl ?? null,
      iconUrl: input.iconUrl ?? null,
      ownerId: input.ownerId,
      categoryId: input.categoryId ?? null,
      memberCount: 0,
      postCount: 0,
      isLocked: false,
    });
    return this.toDomain(await this.repo.save(entity));
  }

  async findAll(input: GetForumListInput): Promise<ForumListPage> {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      visibility,
      userId,
    } = input;
    const qb = this.repo.createQueryBuilder('f');

    if (visibility === 'visible') {
      qb.andWhere('f.visibility = :v1', { v1: 'public' });
    } else if (visibility) {
      qb.andWhere('f.visibility = :v', { v: visibility });
    } else if (userId) {
      qb.andWhere('(f.visibility = :v1 OR f.ownerId = :uid)', {
        v1: 'public',
        uid: userId,
      });
    } else {
      qb.andWhere('f.visibility = :v1', { v1: 'public' });
    }

    if (search) {
      qb.andWhere('(f.name ILIKE :s OR f.description ILIKE :s)', {
        s: `%${search}%`,
      });
    }
    if (categoryId) qb.andWhere('f.categoryId = :categoryId', { categoryId });

    const [entities, total] = await qb
      .orderBy('f.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: entities.map(this.toDomain.bind(this)), total };
  }

  async findBySlug(slug: string): Promise<ForumDomain | null> {
    const e = await this.repo.findOne({ where: { slug } });
    return e ? this.toDomain(e) : null;
  }

  async findById(id: string): Promise<ForumDomain | null> {
    const e = await this.repo.findOne({ where: { id } });
    return e ? this.toDomain(e) : null;
  }

  async update(id: string, input: UpdateForumInput): Promise<ForumDomain> {
    await this.repo.update(id, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.visibility !== undefined && { visibility: input.visibility }),
      ...(input.bannerUrl !== undefined && { bannerUrl: input.bannerUrl }),
      ...(input.iconUrl !== undefined && { iconUrl: input.iconUrl }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      ...(input.isLocked !== undefined && { isLocked: input.isLocked }),
    });
    const updated = await this.repo.findOneOrFail({ where: { id } });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async incrementMemberCount(id: string, delta: number): Promise<void> {
    await this.repo.increment({ id }, 'memberCount', delta);
  }

  async incrementPostCount(id: string, delta: number): Promise<void> {
    await this.repo.increment({ id }, 'postCount', delta);
  }

  async recalculatePostCount(id: string): Promise<number> {
    const result = await this.repo.manager.query(
      `SELECT COUNT(*)::int AS count FROM forum_posts WHERE forum_id = $1 AND status = 'published' AND deleted_at IS NULL`,
      [id],
    );
    const count = result[0]?.count ?? 0;
    await this.repo.update(id, { postCount: count });
    return count;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .concat('-', Math.random().toString(36).slice(2, 8));
}
