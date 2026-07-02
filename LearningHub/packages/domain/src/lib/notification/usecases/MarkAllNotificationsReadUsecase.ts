import { Either, Failure, NoParams, Usecase } from '@learning-hub/core';
import { INotificationRepository } from '../repositories/INotificationRepository';

export class MarkAllNotificationsReadUsecase
  implements Usecase<void, NoParams>
{
  constructor(private repository: INotificationRepository) {}
  async execute(_params: NoParams): Promise<Either<Failure, void>> {
    return this.repository.markAllRead();
  }
}
