import { Either, Failure, Usecase } from '@learning-hub/core';
import {
  ForumListItem,
  ListForumsParams,
  PaginatedResponse,
} from '../entities/entities';
import { IForumRepository } from '../repositories/IForumRepository';

export class ListForumsUsecase
  implements Usecase<PaginatedResponse<ForumListItem>, ListForumsParams>
{
  constructor(private repository: IForumRepository) {}
  async execute(
    params: ListForumsParams,
  ): Promise<Either<Failure, PaginatedResponse<ForumListItem>>> {
    return this.repository.listForums(params);
  }
}
