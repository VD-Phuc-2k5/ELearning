import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';
import { DerivedBank } from '../entities/entities';

export class GetDerivedBanksQuizParams {
  constructor(public bankId: string) {}
}

export class GetDerivedBanksQuizUsecase
  implements Usecase<DerivedBank[], GetDerivedBanksQuizParams>
{
  constructor(private repository: IQuizRepository) {}
  execute(
    params: GetDerivedBanksQuizParams,
  ): Promise<Either<Failure, DerivedBank[]>> {
    return this.repository.getDerivedBanks(params.bankId);
  }
}
