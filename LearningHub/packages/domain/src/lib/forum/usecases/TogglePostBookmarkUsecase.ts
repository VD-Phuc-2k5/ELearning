import { Either, Failure, Usecase } from '@learning-hub/core';
import { TogglePostBookmarkParams } from '../entities/entities';
import { IForumRepository } from '../repositories/IForumRepository';

export class TogglePostBookmarkUsecase
  implements Usecase<void, TogglePostBookmarkParams>
{
  constructor(private repository: IForumRepository) {}
  async execute(
    params: TogglePostBookmarkParams,
  ): Promise<Either<Failure, void>> {
    return this.repository.togglePostBookmark(params);
  }
}
