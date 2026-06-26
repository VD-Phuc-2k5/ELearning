import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';
import { Question } from '../entities/entities';

export class GetQuestionsForQuizParams {
  constructor(public bankId: string) {}
}

export class GetQuestionsForQuizUsecase implements Usecase<Question[], GetQuestionsForQuizParams> {
  constructor(private repository: IQuizRepository) {}
  execute(params: GetQuestionsForQuizParams): Promise<Either<Failure, Question[]>> {
    return this.repository.getQuestionsForQuiz(params.bankId);
  }
}
