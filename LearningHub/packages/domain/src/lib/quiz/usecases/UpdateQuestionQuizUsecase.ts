import { Either, Failure, Usecase } from '@learning-hub/core';
import type { IQuizRepository, UpdateQuestionQuizParams } from '../repositories/IQuizRepository';
import { Question } from '../entities/entities';

export type { UpdateQuestionQuizParams };

export class UpdateQuestionQuizParams2 {
  constructor(public id: string, public data: UpdateQuestionQuizParams) {}
}

export class UpdateQuestionQuizUsecase implements Usecase<Question, UpdateQuestionQuizParams2> {
  constructor(private repository: IQuizRepository) {}
  execute(params: UpdateQuestionQuizParams2): Promise<Either<Failure, Question>> {
    return this.repository.updateQuestion(params.id, params.data);
  }
}
