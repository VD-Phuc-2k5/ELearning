import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumBookmarkEntity } from '../entities/forum-bookmark.entity';
import { IForumBookmarkRepository } from '../../../domain/repositories/forum-bookmark.repository.interface';
import type { ForumBookmarkDomain } from '../../../domain/entities/forum-bookmark.domain';

@Injectable()
export class ForumBookmarkRepository implements IForumBookmarkRepository {
  constructor(
    @InjectRepository(ForumBookmarkEntity)
    private readonly repo: Repository<ForumBookmarkEntity>,
  ) {}

  private toDomain(e: ForumBookmarkEntity): ForumBookmarkDomain {
    return { userId: e.userId, postId: e.postId, createdAt: e.createdAt };
  }

  async exists(userId: string, postId: string): Promise<boolean> {
    const count = await this.repo.count({ where: { userId, postId } });
    return count > 0;
  }

  async add(userId: string, postId: string): Promise<ForumBookmarkDomain> {
    const entity = this.repo.create({ userId, postId });
    return this.toDomain(await this.repo.save(entity));
  }

  async remove(userId: string, postId: string): Promise<void> {
    await this.repo.delete({ userId, postId });
  }

  async findByUser(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: ForumBookmarkDomain[]; total: number }> {
    const [entities, total] = await this.repo.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data: entities.map(this.toDomain), total };
  }
}
