import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumMentionEntity } from '../entities/forum-mention.entity';
import { IForumMentionRepository } from '../../../domain/repositories/forum-notification.repository.interface';
import type { ForumMentionDomain } from '../../../domain/entities/forum-notification.domain';

@Injectable()
export class ForumMentionRepository implements IForumMentionRepository {
  constructor(
    @InjectRepository(ForumMentionEntity)
    private readonly repo: Repository<ForumMentionEntity>,
  ) {}

  async create(input: {
    postId?: string;
    commentId?: string;
    mentionedUserId: string;
  }): Promise<ForumMentionDomain> {
    const entity = this.repo.create({
      postId: input.postId ?? null,
      commentId: input.commentId ?? null,
      mentionedUserId: input.mentionedUserId,
    });
    const saved = await this.repo.save(entity);
    return {
      id: saved.id,
      postId: saved.postId,
      commentId: saved.commentId,
      mentionedUserId: saved.mentionedUserId,
      createdAt: saved.createdAt,
    };
  }

  async findByPost(postId: string): Promise<ForumMentionDomain[]> {
    const mentions = await this.repo.find({ where: { postId } });
    return mentions.map((m) => ({
      id: m.id,
      postId: m.postId,
      commentId: m.commentId,
      mentionedUserId: m.mentionedUserId,
      createdAt: m.createdAt,
    }));
  }
}
