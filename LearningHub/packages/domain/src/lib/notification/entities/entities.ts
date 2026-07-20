export interface NotificationItem {
  readonly id: string;
  readonly actorId: string | null;
  readonly actorName: string | null;
  readonly actorAvatarUrl: string | null;
  readonly type: string;
  readonly targetType: string | null;
  readonly targetId: string | null;
  readonly metadata: Record<string, unknown> | null;
  readonly isRead: boolean;
  readonly createdAt: string;
}

export interface NotificationsPage {
  data: NotificationItem[];
  total: number;
}

export interface ListNotificationsParams {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}
