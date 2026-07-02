import { Inject, Injectable } from '@nestjs/common';
import {
  FORUM_NOTIFICATION_REPOSITORY,
  IForumNotificationRepository,
} from '../../domain/repositories/forum-notification.repository.interface';
import type { ForumNotificationDomain } from '../../domain/entities/forum-notification.domain';

@Injectable()
export class GetMyNotificationsUseCase {
  constructor(
    @Inject(FORUM_NOTIFICATION_REPOSITORY)
    private readonly notifRepo: IForumNotificationRepository,
  ) {}

  execute(
    recipientId: string,
    unreadOnly?: boolean,
    page?: number,
    limit?: number,
  ): Promise<{ data: ForumNotificationDomain[]; total: number }> {
    return this.notifRepo.findByRecipient({
      recipientId,
      unreadOnly,
      page,
      limit,
    });
  }
}

@Injectable()
export class MarkNotificationReadUseCase {
  constructor(
    @Inject(FORUM_NOTIFICATION_REPOSITORY)
    private readonly notifRepo: IForumNotificationRepository,
  ) {}

  execute(id: string, recipientId: string): Promise<void> {
    return this.notifRepo.markRead(id, recipientId);
  }
}

@Injectable()
export class MarkAllNotificationsReadUseCase {
  constructor(
    @Inject(FORUM_NOTIFICATION_REPOSITORY)
    private readonly notifRepo: IForumNotificationRepository,
  ) {}

  execute(recipientId: string): Promise<void> {
    return this.notifRepo.markAllRead(recipientId);
  }
}

@Injectable()
export class CountUnreadNotificationsUseCase {
  constructor(
    @Inject(FORUM_NOTIFICATION_REPOSITORY)
    private readonly notifRepo: IForumNotificationRepository,
  ) {}

  execute(recipientId: string): Promise<number> {
    return this.notifRepo.countUnread(recipientId);
  }
}

@Injectable()
export class DeleteReadNotificationsUseCase {
  constructor(
    @Inject(FORUM_NOTIFICATION_REPOSITORY)
    private readonly notifRepo: IForumNotificationRepository,
  ) {}

  execute(recipientId: string): Promise<void> {
    return this.notifRepo.deleteRead(recipientId);
  }
}
