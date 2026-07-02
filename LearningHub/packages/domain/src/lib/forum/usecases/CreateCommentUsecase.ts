import { Either, Failure, Usecase } from '@learning-hub/core';
import { CommentItem, CreateCommentParams } from '../entities/entities';
import { IForumRepository } from '../repositories/IForumRepository';

export class CreateCommentUsecase
  implements Usecase<CommentItem, CreateCommentParams>
{
  constructor(private repository: IForumRepository) {}
  async execute(
    params: CreateCommentParams,
  ): Promise<Either<Failure, CommentItem>> {
    return this.repository.createComment(params);
  }
}
