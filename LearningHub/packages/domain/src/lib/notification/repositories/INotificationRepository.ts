import { Either, Failure } from '@learning-hub/core';
import {
  ListNotificationsParams,
  NotificationsPage,
} from '../entities/entities';

export interface INotificationRepository {
  listNotifications(
    params: ListNotificationsParams,
  ): Promise<Either<Failure, NotificationsPage>>;
  getUnreadCount(): Promise<Either<Failure, number>>;
  markRead(id: string): Promise<Either<Failure, void>>;
  markAllRead(): Promise<Either<Failure, void>>;
  deleteRead(): Promise<Either<Failure, void>>;
}
