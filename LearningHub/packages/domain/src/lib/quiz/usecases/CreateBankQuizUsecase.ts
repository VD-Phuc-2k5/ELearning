import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository, CreateBankQuizParams } from '../repositories/IQuizRepository';
import { QuestionBank } from '../entities/entities';

export { CreateBankQuizParams };

export class CreateBankQuizUsecase implements Usecase<QuestionBank, CreateBankQuizParams> {
  constructor(private repository: IQuizRepository) {}
  execute(params: CreateBankQuizParams): Promise<Either<Failure, QuestionBank>> {
    return this.repository.createBank(params);
  }
}
