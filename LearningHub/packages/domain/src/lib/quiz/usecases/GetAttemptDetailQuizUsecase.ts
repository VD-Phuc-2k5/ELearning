import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';
import { QuizAttemptDetail } from '../entities/entities';

export class GetAttemptDetailQuizParams {
  constructor(public id: string) {}
}

export class GetAttemptDetailQuizUsecase
  implements Usecase<QuizAttemptDetail, GetAttemptDetailQuizParams>
{
  constructor(private repository: IQuizRepository) {}
  execute(
    params: GetAttemptDetailQuizParams,
  ): Promise<Either<Failure, QuizAttemptDetail>> {
    return this.repository.getAttemptDetail(params.id);
  }
}
