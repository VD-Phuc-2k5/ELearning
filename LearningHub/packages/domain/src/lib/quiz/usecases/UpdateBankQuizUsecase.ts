import { Either, Failure, Usecase } from '@learning-hub/core';
import type {
  IQuizRepository,
  UpdateBankQuizParams,
} from '../repositories/IQuizRepository';
import { QuestionBank } from '../entities/entities';

export class UpdateBankCommand {
  constructor(
    public id: string,
    public data: UpdateBankQuizParams,
  ) {}
}

export class UpdateBankQuizUsecase
  implements Usecase<QuestionBank, UpdateBankCommand>
{
  constructor(private repository: IQuizRepository) {}
  execute(params: UpdateBankCommand): Promise<Either<Failure, QuestionBank>> {
    return this.repository.updateBank(params.id, params.data);
  }
}
