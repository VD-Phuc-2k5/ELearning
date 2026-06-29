import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';
import { BankRoadmapItem } from '../entities/entities';

export class GetBankRoadmapsQuizParams {
  constructor(public bankId: string) {}
}

export class GetBankRoadmapsQuizUsecase
  implements Usecase<BankRoadmapItem[], GetBankRoadmapsQuizParams>
{
  constructor(private repository: IQuizRepository) {}
  execute(
    params: GetBankRoadmapsQuizParams,
  ): Promise<Either<Failure, BankRoadmapItem[]>> {
    return this.repository.getBankRoadmaps(params.bankId);
  }
}
