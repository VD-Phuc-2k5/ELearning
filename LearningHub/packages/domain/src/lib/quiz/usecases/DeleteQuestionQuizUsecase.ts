import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';

export class DeleteQuestionQuizParams {
  constructor(public id: string) {}
}

export class DeleteQuestionQuizUsecase implements Usecase<void, DeleteQuestionQuizParams> {
  constructor(private repository: IQuizRepository) {}
  execute(params: DeleteQuestionQuizParams): Promise<Either<Failure, void>> {
    return this.repository.deleteQuestion(params.id);
  }
}
