import { Either, Failure, Usecase } from '@learning-hub/core';
import { CreatePostParams, PostListItem } from '../entities/entities';
import { IForumRepository } from '../repositories/IForumRepository';

export class CreatePostUsecase
  implements Usecase<PostListItem, CreatePostParams>
{
  constructor(private repository: IForumRepository) {}
  async execute(
    params: CreatePostParams,
  ): Promise<Either<Failure, PostListItem>> {
    return this.repository.createPost(params);
  }
}
