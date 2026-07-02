import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumCommentEntity } from '../entities/forum-comment.entity';
import {
  CommentListPage,
  CreateCommentInput,
  GetCommentsInput,
  IForumCommentRepository,
} from '../../../domain/repositories/forum-comment.repository.interface';
import type {
  CommentStatus,
  ForumCommentDomain,
} from '../../../domain/entities/forum-comment.domain';

@Injectable()
export class ForumCommentRepository implements IForumCommentRepository {
  constructor(
    @InjectRepository(ForumCommentEntity)
    private readonly repo: Repository<ForumCommentEntity>,
  ) {}

  private toDomain(e: ForumCommentEntity): ForumCommentDomain {
    return {
      id: e.id,
      postId: e.postId,
      authorId: e.authorId,
      authorName: e.author?.username ?? 'Unknown',
      authorAvatarUrl: e.author?.avatarUrl ?? null,
      parentId: e.parentId,
      depth: e.depth,
      content: e.content,
      status: e.status as CommentStatus,
      replyCount: e.replyCount,
      reactionCount: e.reactionCount,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      deletedAt: e.deletedAt,
    };
  }

  async create(input: CreateCommentInput): Promise<ForumCommentDomain> {
    const entity = this.repo.create({
      postId: input.postId,
      authorId: input.authorId,
      parentId: input.parentId ?? null,
      depth: input.depth,
      content: input.content,
      status: 'published',
    });
    const saved = await this.repo.save(entity);
    const loaded = await this.repo.findOneOrFail({
      where: { id: saved.id },
      relations: { author: true },
    });
    return this.toDomain(loaded);
  }

  async findById(id: string): Promise<ForumCommentDomain | null> {
    const e = await this.repo.findOne({
      where: { id },
      relations: { author: true },
    });
    return e ? this.toDomain(e) : null;
  }

  async findByIdAndPost(
    id: string,
    postId: string,
  ): Promise<ForumCommentDomain | null> {
    const e = await this.repo.findOne({
      where: { id, postId },
      relations: { author: true },
    });
    return e ? this.toDomain(e) : null;
  }

  async findAll(input: GetCommentsInput): Promise<CommentListPage> {
    const { postId, page = 1, limit = 50 } = input;
    const qb = this.repo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.author', 'author')
      .where('c.postId = :postId', { postId })
      .andWhere('c.status = :status', { status: 'published' })
      .orderBy('c.depth', 'ASC')
      .addOrderBy('c.createdAt', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await qb.getManyAndCount();
    return { data: entities.map(this.toDomain.bind(this)), total };
  }

  async update(id: string, content: string): Promise<ForumCommentDomain> {
    await this.repo.update(id, { content });
    const updated = await this.repo.findOneOrFail({
      where: { id },
      relations: { author: true },
    });
    return this.toDomain(updated);
  }

  async updateStatus(id: string, status: string): Promise<ForumCommentDomain> {
    await this.repo.update(id, { status });
    const updated = await this.repo.findOneOrFail({
      where: { id },
      relations: { author: true },
    });
    return this.toDomain(updated);
  }

  async incrementReplyCount(id: string, delta: number): Promise<void> {
    await this.repo.increment({ id }, 'replyCount', delta);
  }

  async incrementReactionCount(id: string, delta: number): Promise<void> {
    await this.repo.increment({ id }, 'reactionCount', delta);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
