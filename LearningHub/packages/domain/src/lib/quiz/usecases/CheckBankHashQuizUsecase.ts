import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';
import { QuestionBank } from '../entities/entities';

export class CheckBankHashQuizParams {
  constructor(public hash: string) {}
}

export class CheckBankHashQuizUsecase implements Usecase<{ exists: boolean; bank?: QuestionBank }, CheckBankHashQuizParams> {
  constructor(private repository: IQuizRepository) {}
  execute(params: CheckBankHashQuizParams): Promise<Either<Failure, { exists: boolean; bank?: QuestionBank }>> {
    return this.repository.checkBankHash(params.hash);
  }
}
