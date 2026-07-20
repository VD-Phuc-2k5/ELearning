import { Either, Failure, Usecase } from '@learning-hub/core';
import { JoinForumParams } from '../entities/entities';
import { IForumRepository } from '../repositories/IForumRepository';

export class JoinForumUsecase implements Usecase<void, JoinForumParams> {
  constructor(private repository: IForumRepository) {}
  async execute(params: JoinForumParams): Promise<Either<Failure, void>> {
    return this.repository.joinForum(params);
  }
}
