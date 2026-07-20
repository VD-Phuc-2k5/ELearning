import { Either, Failure, Usecase } from '@learning-hub/core';
import { INotificationRepository } from '../repositories/INotificationRepository';

export class MarkNotificationReadUsecase implements Usecase<void, string> {
  constructor(private repository: INotificationRepository) {}
  async execute(id: string): Promise<Either<Failure, void>> {
    return this.repository.markRead(id);
  }
}
