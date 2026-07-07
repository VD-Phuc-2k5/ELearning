import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';
import { QuestionBank } from '../entities/entities';

export class ApproveBankQuizUsecase implements Usecase<QuestionBank, string> {
  constructor(private repository: IQuizRepository) {}
  execute(bankId: string): Promise<Either<Failure, QuestionBank>> {
    return this.repository.approveBank(bankId);
  }
}
