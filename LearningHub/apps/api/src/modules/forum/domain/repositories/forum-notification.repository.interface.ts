import type {
  ForumMentionDomain,
  ForumNotificationDomain,
} from '../entities/forum-notification.domain';

export interface CreateNotificationInput {
  recipientId: string;
  actorId?: string;
  type: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

export interface GetNotificationsInput {
  recipientId: string;
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface IForumNotificationRepository {
  create(input: CreateNotificationInput): Promise<ForumNotificationDomain>;
  findByRecipient(
    input: GetNotificationsInput,
  ): Promise<{ data: ForumNotificationDomain[]; total: number }>;
  markRead(id: string, recipientId: string): Promise<void>;
  markAllRead(recipientId: string): Promise<void>;
  countUnread(recipientId: string): Promise<number>;
  deleteRead(recipientId: string): Promise<void>;
}

export const FORUM_NOTIFICATION_REPOSITORY = Symbol(
  'IForumNotificationRepository',
);

export interface IForumMentionRepository {
  create(input: {
    postId?: string;
    commentId?: string;
    mentionedUserId: string;
  }): Promise<ForumMentionDomain>;
  findByPost(postId: string): Promise<ForumMentionDomain[]>;
}

export const FORUM_MENTION_REPOSITORY = Symbol('IForumMentionRepository');
