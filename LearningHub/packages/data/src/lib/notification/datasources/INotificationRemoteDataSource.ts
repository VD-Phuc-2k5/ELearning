import {
  ListNotificationsParams,
  NotificationsPage,
} from '@learning-hub/domain';

export interface INotificationRemoteDataSource {
  setToken(token: string): void;
  listNotifications(
    params: ListNotificationsParams,
  ): Promise<NotificationsPage>;
  getUnreadCount(): Promise<number>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
  deleteRead(): Promise<void>;
}
