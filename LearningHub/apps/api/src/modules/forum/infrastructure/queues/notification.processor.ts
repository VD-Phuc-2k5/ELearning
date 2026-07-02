import { Inject, Logger } from '@nestjs/common';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';
import { ForumFollowEntity } from '../../infrastructure/persistence/entities/forum-follow.entity';
import {
  FORUM_NOTIFICATION_REPOSITORY,
  IForumNotificationRepository,
} from '../../domain/repositories/forum-notification.repository.interface';
import {
  IForumGateway,
  FORUM_GATEWAY,
} from '../../application/interfaces/i-forum-gateway';
import { FORUM_QUEUE_NAME } from './queue-names';
import type {
  BulkNotifyFollowersPayload,
  NotificationJobPayload,
  PollEndedJobPayload,
} from '../../application/services/notification.service';

@Processor(FORUM_QUEUE_NAME, { concurrency: 5 })
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @Inject(FORUM_NOTIFICATION_REPOSITORY)
    private readonly notifRepo: IForumNotificationRepository,
    @Inject(FORUM_GATEWAY)
    private readonly gateway: IForumGateway,
    @InjectRepository(ForumFollowEntity)
    private readonly followRepo: Repository<ForumFollowEntity>,
  ) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    this.logger.log(`Processing job ${job.name} (id=${job.id})`);
    switch (job.name) {
      case 'send': {
        const payload = job.data as NotificationJobPayload;
        this.gateway.emitNotification(payload.recipientId, {
          type: payload.type,
          targetType: payload.targetType,
          targetId: payload.targetId,
          metadata: payload.metadata,
        });
        return { delivered: true };
      }
      case 'poll-ended': {
        const payload = job.data as PollEndedJobPayload;
        return this.handlePollEnded(payload);
      }
      case 'bulk-notify-followers': {
        const payload = job.data as BulkNotifyFollowersPayload;
        return this.handleBulkFollowers(payload);
      }
      default:
        this.logger.warn(`Unknown job name "${job.name}"`);
        return { skipped: true };
    }
  }

  private async handlePollEnded(
    payload: PollEndedJobPayload,
  ): Promise<unknown> {
    this.gateway.emitPollUpdate(payload.postId, { pollEnded: true });
    return { notified: true };
  }

  private async handleBulkFollowers(
    payload: BulkNotifyFollowersPayload,
  ): Promise<unknown> {
    const follows = await this.followRepo.find({
      where: { forumId: payload.forumId },
    });
    for (const follow of follows) {
      await this.notifRepo.create({
        recipientId: follow.userId,
        actorId: payload.actorId,
        type: payload.type,
        targetType: payload.targetType,
        targetId: payload.targetId,
      });
      this.gateway.emitNotification(follow.userId, {
        type: payload.type,
        targetType: payload.targetType,
        targetId: payload.targetId,
      });
    }
    return { recipients: follows.length };
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, err: Error): void {
    this.logger.error(`Job ${job?.name} failed: ${err.message}`, err.stack);
  }
}
