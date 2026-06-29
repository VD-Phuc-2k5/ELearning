import { Either, Failure, Usecase } from '@learning-hub/core';
import { CreateForumParams, ForumListItem } from '../entities/entities';
import { IForumRepository } from '../repositories/IForumRepository';

export class CreateForumUsecase
  implements Usecase<ForumListItem, CreateForumParams>
{
  constructor(private repository: IForumRepository) {}
  async execute(
    params: CreateForumParams,
  ): Promise<Either<Failure, ForumListItem>> {
    return this.repository.createForum(params);
  }
}
