import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';

export class DeleteBankQuizParams {
  constructor(public id: string) {}
}

export class DeleteBankQuizUsecase implements Usecase<void, DeleteBankQuizParams> {
  constructor(private repository: IQuizRepository) {}
  execute(params: DeleteBankQuizParams): Promise<Either<Failure, void>> {
    return this.repository.deleteBank(params.id);
  }
}
