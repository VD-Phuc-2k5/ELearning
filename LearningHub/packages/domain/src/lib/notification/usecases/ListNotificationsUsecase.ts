import { Either, Failure, Usecase } from '@learning-hub/core';
import { INotificationRepository } from '../repositories/INotificationRepository';
import {
  ListNotificationsParams,
  NotificationsPage,
} from '../entities/entities';

export class ListNotificationsUsecase
  implements Usecase<NotificationsPage, ListNotificationsParams>
{
  constructor(private repository: INotificationRepository) {}
  async execute(
    params: ListNotificationsParams,
  ): Promise<Either<Failure, NotificationsPage>> {
    return this.repository.listNotifications(params);
  }
}
