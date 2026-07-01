import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumNotificationEntity } from '../entities/forum-notification.entity';
import {
  CreateNotificationInput,
  GetNotificationsInput,
  IForumNotificationRepository,
} from '../../../domain/repositories/forum-notification.repository.interface';
import type { ForumNotificationDomain } from '../../../domain/entities/forum-notification.domain';

@Injectable()
export class ForumNotificationRepository
  implements IForumNotificationRepository
{
  constructor(
    @InjectRepository(ForumNotificationEntity)
    private readonly repo: Repository<ForumNotificationEntity>,
  ) {}

  private toDomain(e: ForumNotificationEntity): ForumNotificationDomain {
    return {
      id: e.id,
      recipientId: e.recipientId,
      actorId: e.actorId,
      actorName: e.actor?.username ?? null,
      actorAvatarUrl: e.actor?.avatarUrl ?? null,
      type: e.type,
      targetType: e.targetType,
      targetId: e.targetId,
      metadata: e.metadata,
      isRead: e.isRead,
      createdAt: e.createdAt,
    };
  }

  async create(
    input: CreateNotificationInput,
  ): Promise<ForumNotificationDomain> {
    const entity = this.repo.create({
      recipientId: input.recipientId,
      actorId: input.actorId ?? null,
      type: input.type,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      metadata: input.metadata ?? null,
      isRead: false,
    });
    return this.toDomain(await this.repo.save(entity));
  }

  async findByRecipient(
    input: GetNotificationsInput,
  ): Promise<{ data: ForumNotificationDomain[]; total: number }> {
    const { recipientId, unreadOnly, page = 1, limit = 20 } = input;
    const where: Record<string, unknown> = { recipientId };
    if (unreadOnly) where.isRead = false;
    const [entities, total] = await this.repo.findAndCount({
      where,
      relations: { actor: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data: entities.map(this.toDomain), total };
  }

  async markRead(id: string, recipientId: string): Promise<void> {
    await this.repo.update({ id, recipientId }, { isRead: true });
  }

  async markAllRead(recipientId: string): Promise<void> {
    await this.repo.update({ recipientId, isRead: false }, { isRead: true });
  }

  async countUnread(recipientId: string): Promise<number> {
    return this.repo.count({ where: { recipientId, isRead: false } });
  }
}
