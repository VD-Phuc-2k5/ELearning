import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';
import { QuestionBank } from '../entities/entities';

export class RejectBankQuizParams {
  constructor(
    public bankId: string,
    public reason?: string,
  ) {}
}

export class RejectBankQuizUsecase
  implements Usecase<QuestionBank, RejectBankQuizParams>
{
  constructor(private repository: IQuizRepository) {}
  execute(
    params: RejectBankQuizParams,
  ): Promise<Either<Failure, QuestionBank>> {
    return this.repository.rejectBank(params.bankId, params.reason);
  }
}
