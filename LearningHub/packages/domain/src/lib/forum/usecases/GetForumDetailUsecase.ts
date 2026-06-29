import { Either, Failure, Usecase } from '@learning-hub/core';
import { ForumDetailResponse } from '../entities/entities';
import { IForumRepository } from '../repositories/IForumRepository';

export class GetForumDetailUsecase
  implements Usecase<ForumDetailResponse, string>
{
  constructor(private repository: IForumRepository) {}
  async execute(params: string): Promise<Either<Failure, ForumDetailResponse>> {
    return this.repository.getForumDetail(params);
  }
}
