import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';
import { VerifyAnswerResult } from '../entities/entities';

export class VerifyAnswerQuizParams {
  constructor(public questionId: string, public selectedOptionId: string) {}
}

export class VerifyAnswerQuizUsecase implements Usecase<VerifyAnswerResult, VerifyAnswerQuizParams> {
  constructor(private repository: IQuizRepository) {}
  execute(params: VerifyAnswerQuizParams): Promise<Either<Failure, VerifyAnswerResult>> {
    return this.repository.verifyAnswer(params.questionId, params.selectedOptionId);
  }
}
