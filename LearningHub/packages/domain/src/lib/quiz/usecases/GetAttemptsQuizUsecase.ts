import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';
import { AttemptList } from '../entities/entities';

export class GetAttemptsQuizParams {
  constructor(
    public page?: number,
    public limit?: number,
    public bankId?: string,
  ) {}
}

export class GetAttemptsQuizUsecase
  implements Usecase<AttemptList, GetAttemptsQuizParams>
{
  constructor(private repository: IQuizRepository) {}
  execute(
    params: GetAttemptsQuizParams,
  ): Promise<Either<Failure, AttemptList>> {
    return this.repository.getAttempts({
      page: params.page,
      limit: params.limit,
      bankId: params.bankId,
    });
  }
}
