import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';
import { Tag } from '../entities/entities';

export class CreateTagQuizParams {
  constructor(public name: string) {}
}

export class CreateTagQuizUsecase implements Usecase<Tag, CreateTagQuizParams> {
  constructor(private repository: IQuizRepository) {}
  execute(params: CreateTagQuizParams): Promise<Either<Failure, Tag>> {
    return this.repository.createTag(params.name);
  }
}
