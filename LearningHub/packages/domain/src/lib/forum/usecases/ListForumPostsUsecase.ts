import { Either, Failure, Usecase } from '@learning-hub/core';
import {
  ListForumPostsParams,
  PaginatedResponse,
  PostListItem,
} from '../entities/entities';
import { IForumRepository } from '../repositories/IForumRepository';

export class ListForumPostsUsecase
  implements Usecase<PaginatedResponse<PostListItem>, ListForumPostsParams>
{
  constructor(private repository: IForumRepository) {}
  async execute(
    params: ListForumPostsParams,
  ): Promise<Either<Failure, PaginatedResponse<PostListItem>>> {
    return this.repository.listForumPosts(params);
  }
}
