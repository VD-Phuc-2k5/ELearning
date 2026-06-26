import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';
import { QuizAnswer, QuizResult } from '../entities/entities';

export class SubmitQuizParams {
  constructor(
    public bankId: string,
    public answers: QuizAnswer[],
  ) {}
}

export class SubmitQuizUsecase implements Usecase<QuizResult, SubmitQuizParams> {
  constructor(private repository: IQuizRepository) {}
  execute(params: SubmitQuizParams): Promise<Either<Failure, QuizResult>> {
    return this.repository.submitQuiz(params.bankId, params.answers);
  }
}
