import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';
import { BankHashResult } from '../entities/entities';

export class CheckBankHashQuizParams {
  constructor(public hash: string) {}
}

export class CheckBankHashQuizUsecase implements Usecase<BankHashResult, CheckBankHashQuizParams> {
  constructor(private repository: IQuizRepository) {}
  execute(params: CheckBankHashQuizParams): Promise<Either<Failure, BankHashResult>> {
    return this.repository.checkBankHash(params.hash);
  }
}
