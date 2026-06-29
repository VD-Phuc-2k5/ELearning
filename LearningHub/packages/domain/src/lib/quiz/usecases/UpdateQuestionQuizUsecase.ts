import { Either, Failure, Usecase } from '@learning-hub/core';
import type {
  IQuizRepository,
  UpdateQuestionQuizParams,
} from '../repositories/IQuizRepository';
import { Question } from '../entities/entities';

export class UpdateQuestionCommand {
  constructor(
    public id: string,
    public data: UpdateQuestionQuizParams,
  ) {}
}

export class UpdateQuestionQuizUsecase
  implements Usecase<Question, UpdateQuestionCommand>
{
  constructor(private repository: IQuizRepository) {}
  execute(params: UpdateQuestionCommand): Promise<Either<Failure, Question>> {
    return this.repository.updateQuestion(params.id, params.data);
  }
}
