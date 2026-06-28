import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';
import { UserBankProgress } from '../entities/entities';

export class GetBankProgressQuizParams {
  constructor(public bankId: string) {}
}

export class GetBankProgressQuizUsecase
  implements Usecase<UserBankProgress | null, GetBankProgressQuizParams>
{
  constructor(private repository: IQuizRepository) {}
  execute(
    params: GetBankProgressQuizParams,
  ): Promise<Either<Failure, UserBankProgress | null>> {
    return this.repository.getBankProgress(params.bankId);
  }
}
