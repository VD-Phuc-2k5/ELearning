import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';
import { QuestionBank } from '../entities/entities';

export class GetBankDetailQuizParams {
  constructor(public id: string) {}
}

export class GetBankDetailQuizUsecase implements Usecase<QuestionBank, GetBankDetailQuizParams> {
  constructor(private repository: IQuizRepository) {}
  execute(params: GetBankDetailQuizParams): Promise<Either<Failure, QuestionBank>> {
    return this.repository.getBankDetail(params.id);
  }
}
