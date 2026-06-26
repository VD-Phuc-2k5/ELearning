import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository, UpdateBankQuizParams } from '../repositories/IQuizRepository';
import { QuestionBank } from '../entities/entities';

export { UpdateBankQuizParams };

export class UpdateBankQuizParams2 {
  constructor(public id: string, public data: UpdateBankQuizParams) {}
}

export class UpdateBankQuizUsecase implements Usecase<QuestionBank, UpdateBankQuizParams2> {
  constructor(private repository: IQuizRepository) {}
  execute(params: UpdateBankQuizParams2): Promise<Either<Failure, QuestionBank>> {
    return this.repository.updateBank(params.id, params.data);
  }
}
