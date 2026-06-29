import { Either, Failure, NoParams, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';
import { Tag } from '../entities/entities';

export class GetTagsQuizUsecase implements Usecase<Tag[], NoParams> {
  constructor(private repository: IQuizRepository) {}
  execute(_params: NoParams): Promise<Either<Failure, Tag[]>> {
    return this.repository.getTags();
  }
}
