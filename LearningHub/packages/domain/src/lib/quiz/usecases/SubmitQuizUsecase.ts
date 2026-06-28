import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';
import { QuizAnswer, QuizSubmitResult } from '../entities/entities';

export class SubmitQuizParams {
  constructor(
    public bankId: string,
    public answers: QuizAnswer[],
    public roadmapId?: string | null,
    public durationSeconds?: number,
  ) {}
}

export class SubmitQuizUsecase
  implements Usecase<QuizSubmitResult, SubmitQuizParams>
{
  constructor(private repository: IQuizRepository) {}
  execute(
    params: SubmitQuizParams,
  ): Promise<Either<Failure, QuizSubmitResult>> {
    return this.repository.submitQuiz(
      params.bankId,
      params.answers,
      params.roadmapId,
      params.durationSeconds,
    );
  }
}
