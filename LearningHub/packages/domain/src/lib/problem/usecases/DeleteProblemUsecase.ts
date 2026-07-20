import { Either, Failure, Usecase } from '@learning-hub/core';
import { IProblemRepository } from '../repositories/IProblemRepository';

export class DeleteProblemUsecase implements Usecase<void, string> {
  constructor(private repository: IProblemRepository) {}
  execute(id: string): Promise<Either<Failure, void>> {
    return this.repository.deleteProblem(id);
  }
}
