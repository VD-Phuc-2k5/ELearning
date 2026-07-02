import { Either, Failure, NoParams, Usecase } from '@learning-hub/core';
import { INotificationRepository } from '../repositories/INotificationRepository';

export class CountUnreadNotificationsUsecase
  implements Usecase<number, NoParams>
{
  constructor(private repository: INotificationRepository) {}
  async execute(_params: NoParams): Promise<Either<Failure, number>> {
    return this.repository.getUnreadCount();
  }
}
