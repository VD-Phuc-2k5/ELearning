import { Injectable, Inject } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import {
  FORUM_NOTIFICATION_REPOSITORY,
  IForumNotificationRepository,
  CreateNotificationInput,
} from '../../domain/repositories/forum-notification.repository.interface';
import { FORUM_QUEUE_NAME } from '../../infrastructure/queues/queue-names';
import type { ForumNotificationDomain } from '../../domain/entities/forum-notification.domain';

export interface NotificationJobPayload {
  recipientId: string;
  actorId: string | null;
  type: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
}

export interface PollEndedJobPayload {
  pollId: string;
  postId: string;
  forumId: string;
}

export interface BulkNotifyFollowersPayload {
  forumId: string;
  type: string;
  targetType: string;
  targetId: string;
  actorId: string;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectQueue(FORUM_QUEUE_NAME) private readonly queue: Queue,
    @Inject(FORUM_NOTIFICATION_REPOSITORY)
    private readonly notificationRepo: IForumNotificationRepository,
  ) {}

  async sendNotification(
    input: CreateNotificationInput,
  ): Promise<ForumNotificationDomain> {
    const notification = await this.notificationRepo.create(input);
    await this.queue.add('send', {
      recipientId: input.recipientId,
      actorId: input.actorId ?? null,
      type: input.type,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      metadata: input.metadata ?? null,
    } satisfies NotificationJobPayload);
    return notification;
  }

  schedulePollEnded(
    payload: PollEndedJobPayload,
    delayMs: number,
  ): Promise<void> {
    return this.queue
      .add('poll-ended', payload, { delay: delayMs })
      .then(() => undefined);
  }

  async bulkNotifyFollowers(
    payload: BulkNotifyFollowersPayload,
  ): Promise<void> {
    await this.queue.add('bulk-notify-followers', payload);
  }
}
