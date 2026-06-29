import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumDraftEntity } from '../entities/forum-draft.entity';
import {
  IForumDraftRepository,
  UpsertDraftInput,
} from '../../../domain/repositories/forum-draft.repository.interface';
import type { ForumDraftDomain } from '../../../domain/entities/forum-draft.domain';
import type { PostType } from '../../../domain/entities/forum-post.domain';

@Injectable()
export class ForumDraftRepository implements IForumDraftRepository {
  constructor(
    @InjectRepository(ForumDraftEntity)
    private readonly repo: Repository<ForumDraftEntity>,
  ) {}

  private toDomain(e: ForumDraftEntity): ForumDraftDomain {
    return {
      id: e.id,
      authorId: e.authorId,
      forumId: e.forumId,
      title: e.title,
      content: e.content,
      postType: e.postType as PostType,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }

  async findByAuthor(
    authorId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: ForumDraftDomain[]; total: number }> {
    const [entities, total] = await this.repo.findAndCount({
      where: { authorId },
      skip: (page - 1) * limit,
      take: limit,
      order: { updatedAt: 'DESC' },
    });
    return { data: entities.map(this.toDomain.bind(this)), total };
  }

  async findById(id: string): Promise<ForumDraftDomain | null> {
    const e = await this.repo.findOne({ where: { id } });
    return e ? this.toDomain(e) : null;
  }

  async upsert(
    input: UpsertDraftInput,
    existingId?: string,
  ): Promise<ForumDraftDomain> {
    if (existingId) {
      const existing = await this.repo.findOne({ where: { id: existingId } });
      if (!existing || existing.authorId !== input.authorId) {
        return this.upsert({ ...input }, undefined);
      }
      const updateData: Record<string, unknown> = {};
      if (input.forumId !== undefined) updateData.forumId = input.forumId;
      if (input.title !== undefined) updateData.title = input.title;
      if (input.content !== undefined) updateData.content = input.content;
      if (input.postType !== undefined) updateData.postType = input.postType;
      await this.repo.update(existingId, updateData as never);
      return this.toDomain(
        await this.repo.findOneOrFail({ where: { id: existingId } }),
      );
    }
    const entity = this.repo.create({
      authorId: input.authorId,
      forumId: input.forumId ?? null,
      title: input.title ?? null,
      content: input.content ?? null,
      postType: input.postType ?? 'text',
    });
    return this.toDomain(await this.repo.save(entity));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
