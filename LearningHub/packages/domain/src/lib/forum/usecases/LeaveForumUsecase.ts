import { Either, Failure, Usecase } from '@learning-hub/core';
import { IForumRepository } from '../repositories/IForumRepository';

export class LeaveForumUsecase implements Usecase<void, string> {
  constructor(private repository: IForumRepository) {}
  async execute(params: string): Promise<Either<Failure, void>> {
    return this.repository.leaveForum(params);
  }
}
