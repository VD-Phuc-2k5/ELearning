import { Either, Failure, Usecase } from '@learning-hub/core';
import { TogglePostReactionParams } from '../entities/entities';
import { IForumRepository } from '../repositories/IForumRepository';

export class TogglePostReactionUsecase
  implements Usecase<void, TogglePostReactionParams>
{
  constructor(private repository: IForumRepository) {}
  async execute(
    params: TogglePostReactionParams,
  ): Promise<Either<Failure, void>> {
    return this.repository.togglePostReaction(params);
  }
}
