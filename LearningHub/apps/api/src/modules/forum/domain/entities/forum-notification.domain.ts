export interface ForumNotificationDomain {
  id: string;
  recipientId: string;
  actorId: string | null;
  type: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: Date;
}

export interface ForumMentionDomain {
  id: string;
  postId: string | null;
  commentId: string | null;
  mentionedUserId: string;
  createdAt: Date;
}
