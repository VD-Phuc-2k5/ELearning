import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { ForumPostEntity } from '../entities/forum-post.entity';
import { ForumTagEntity } from '../entities/forum-tag.entity';
import { UserEntity } from '../../../../auth/infrastructure/persistence/entities/user.entity';
import {
  CreatePostInput,
  GetPostsInput,
  IForumPostRepository,
  PostListPage,
  UpdatePostInput,
} from '../../../domain/repositories/forum-post.repository.interface';
import type {
  ForumPostDomain,
  PostStatus,
  PostType,
} from '../../../domain/entities/forum-post.domain';

@Injectable()
export class ForumPostRepository implements IForumPostRepository {
  constructor(
    @InjectRepository(ForumPostEntity)
    private readonly repo: Repository<ForumPostEntity>,
    private readonly dataSource: DataSource,
  ) {}

  private toDomain(e: ForumPostEntity): ForumPostDomain {
    return {
      id: e.id,
      forumId: e.forumId,
      authorId: e.authorId,
      authorName: 'Unknown',
      authorAvatarUrl: null,
      title: e.title,
      content: e.content,
      postType: e.postType as PostType,
      status: e.status as PostStatus,
      isPinned: e.isPinned,
      isLocked: e.isLocked,
      commentCount: e.commentCount,
      reactionCount: e.reactionCount,
      viewCount: e.viewCount,
      roadmapId: e.roadmapId,
      questionBankId: e.questionBankId ?? null,
      tags: (e.tags ?? []).map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        color: t.color,
      })),
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      deletedAt: e.deletedAt,
    };
  }

  async create(input: CreatePostInput): Promise<ForumPostDomain> {
    return this.dataSource.transaction(async (manager) => {
      const tags =
        input.tagIds && input.tagIds.length > 0
          ? await manager.find(ForumTagEntity, {
              where: { id: In(input.tagIds) },
            })
          : [];
      const entity = manager.create(ForumPostEntity, {
        forumId: input.forumId,
        authorId: input.authorId,
        title: input.title,
        content: input.content ?? null,
        postType: input.postType ?? 'text',
        status: input.status ?? 'published',
        roadmapId: input.roadmapId ?? null,
        questionBankId: input.questionBankId ?? null,
        tags,
      });
      const saved = await manager.save(ForumPostEntity, entity);

      const domain = this.toDomain(saved);
      if (input.authorId) {
        const user = await manager.findOne(UserEntity, {
          where: { id: input.authorId },
          select: { id: true, username: true },
        });
        domain.authorName = user?.username ?? 'Unknown';
      }
      return domain;
    });
  }

  async findById(id: string): Promise<ForumPostDomain | null> {
    const e = await this.repo.findOne({ where: { id } });
    if (!e) return null;
    const domain = this.toDomain(e);
    const user = await this.dataSource.manager.findOne(UserEntity, {
      where: { id: e.authorId },
      select: { id: true, username: true },
    });
    domain.authorName = user?.username ?? 'Unknown';
    return domain;
  }

  async findByIdAndForum(
    id: string,
    forumId: string,
  ): Promise<ForumPostDomain | null> {
    const e = await this.repo.findOne({ where: { id, forumId } });
    if (!e) return null;
    const domain = this.toDomain(e);
    const user = await this.dataSource.manager.findOne(UserEntity, {
      where: { id: e.authorId },
      select: { id: true, username: true },
    });
    domain.authorName = user?.username ?? 'Unknown';
    return domain;
  }

  async findAll(input: GetPostsInput): Promise<PostListPage> {
    const {
      forumId,
      page = 1,
      limit = 10,
      search,
      tagId,
      status = 'published',
      includeHidden = false,
      pinnedFirst = true,
    } = input;

    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.tags', 'tags')
      .where('p.forumId = :forumId', { forumId });

    if (!includeHidden) {
      qb.andWhere('p.status = :status', { status });
    } else if (status) {
      qb.andWhere('p.status = :status', { status });
    }

    if (search) {
      qb.andWhere('p.title ILIKE :search', { search: `%${search}%` });
    }

    if (tagId !== undefined) {
      qb.andWhere(
        `EXISTS (SELECT 1 FROM forum_post_tags fpt WHERE fpt.post_id = p.id AND fpt.tag_id = :tagId)`,
        { tagId },
      );
    }

    if (pinnedFirst) {
      qb.orderBy('p.isPinned', 'DESC');
    }
    qb.addOrderBy('p.createdAt', 'DESC');

    const [entities, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const authorIds = [
      ...new Set(entities.map((e) => e.authorId).filter(Boolean)),
    ];
    const authorMap = new Map<string, string>();
    if (authorIds.length > 0) {
      const users = await this.dataSource.manager.find(UserEntity, {
        where: { id: In(authorIds) },
        select: { id: true, username: true },
      });
      for (const u of users) {
        authorMap.set(u.id, u.username);
      }
    }

    return {
      data: entities.map((e) => {
        const domain = this.toDomain(e);
        domain.authorName = authorMap.get(e.authorId) ?? 'Unknown';
        return domain;
      }),
      total,
    };
  }

  async update(id: string, input: UpdatePostInput): Promise<ForumPostDomain> {
    return this.dataSource.transaction(async (manager) => {
      const entity = await manager.findOneOrFail(ForumPostEntity, {
        where: { id },
        relations: { tags: true },
      });
      if (input.title !== undefined) entity.title = input.title;
      if (input.content !== undefined) entity.content = input.content;
      if (input.tagIds !== undefined) {
        entity.tags =
          input.tagIds.length > 0
            ? await manager.find(ForumTagEntity, {
                where: { id: In(input.tagIds) },
              })
            : [];
      }
      const saved = await manager.save(ForumPostEntity, entity);
      const domain = this.toDomain(saved);
      const user = await manager.findOne(UserEntity, {
        where: { id: saved.authorId },
        select: { id: true, username: true },
      });
      domain.authorName = user?.username ?? 'Unknown';
      return domain;
    });
  }

  async updateStatus(id: string, status: PostStatus): Promise<ForumPostDomain> {
    await this.repo.update(id, { status });
    const updated = await this.repo.findOneOrFail({ where: { id } });
    const domain = this.toDomain(updated);
    const user = await this.dataSource.manager.findOne(UserEntity, {
      where: { id: updated.authorId },
      select: { id: true, username: true },
    });
    domain.authorName = user?.username ?? 'Unknown';
    return domain;
  }

  async setPinned(id: string, isPinned: boolean): Promise<ForumPostDomain> {
    await this.repo.update(id, { isPinned });
    const updated = await this.repo.findOneOrFail({ where: { id } });
    const domain = this.toDomain(updated);
    const user = await this.dataSource.manager.findOne(UserEntity, {
      where: { id: updated.authorId },
      select: { id: true, username: true },
    });
    domain.authorName = user?.username ?? 'Unknown';
    return domain;
  }

  async setLocked(id: string, isLocked: boolean): Promise<ForumPostDomain> {
    await this.repo.update(id, { isLocked });
    const updated = await this.repo.findOneOrFail({ where: { id } });
    const domain = this.toDomain(updated);
    const user = await this.dataSource.manager.findOne(UserEntity, {
      where: { id: updated.authorId },
      select: { id: true, username: true },
    });
    domain.authorName = user?.username ?? 'Unknown';
    return domain;
  }

  async incrementCommentCount(id: string, delta: number): Promise<void> {
    await this.repo.query(
      `UPDATE "forum_posts" SET "comment_count" = GREATEST(0, "comment_count" + $1) WHERE "id" = $2`,
      [delta, id],
    );
  }

  async incrementReactionCount(id: string, delta: number): Promise<void> {
    await this.repo.increment({ id }, 'reactionCount', delta);
  }

  async incrementViewCount(id: string, delta: number): Promise<void> {
    await this.repo.increment({ id }, 'viewCount', delta);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
