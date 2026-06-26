import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository, GetBanksQuizParams } from '../repositories/IQuizRepository';
import { BankList } from '../entities/entities';

export { GetBanksQuizParams };

export class GetBanksQuizUsecase implements Usecase<BankList, GetBanksQuizParams> {
  constructor(private repository: IQuizRepository) {}
  execute(params: GetBanksQuizParams): Promise<Either<Failure, BankList>> {
    return this.repository.getBanks(params);
  }
}
