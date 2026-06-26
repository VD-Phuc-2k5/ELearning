import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';

export class VerifyAnswerQuizParams {
  constructor(public questionId: string, public selectedOptionId: string) {}
}

export class VerifyAnswerQuizUsecase implements Usecase<{ isCorrect: boolean; correctOptionId?: string }, VerifyAnswerQuizParams> {
  constructor(private repository: IQuizRepository) {}
  execute(params: VerifyAnswerQuizParams): Promise<Either<Failure, { isCorrect: boolean; correctOptionId?: string }>> {
    return this.repository.verifyAnswer(params.questionId, params.selectedOptionId);
  }
}
