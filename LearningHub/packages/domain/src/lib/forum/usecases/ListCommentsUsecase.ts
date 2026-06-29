import { Either, Failure, Usecase } from '@learning-hub/core';
import {
  CommentItem,
  ListCommentsParams,
  PaginatedResponse,
} from '../entities/entities';
import { IForumRepository } from '../repositories/IForumRepository';

export class ListCommentsUsecase
  implements Usecase<PaginatedResponse<CommentItem>, ListCommentsParams>
{
  constructor(private repository: IForumRepository) {}
  async execute(
    params: ListCommentsParams,
  ): Promise<Either<Failure, PaginatedResponse<CommentItem>>> {
    return this.repository.listComments(params);
  }
}
