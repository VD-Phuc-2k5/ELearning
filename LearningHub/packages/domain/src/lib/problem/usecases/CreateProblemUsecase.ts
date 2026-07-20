import { Either, Failure, Usecase } from '@learning-hub/core';
import { IProblemRepository } from '../repositories/IProblemRepository';
import { Problem, CreateProblemParams } from '../entities/entities';

export class CreateProblemUsecase
  implements Usecase<Problem, CreateProblemParams>
{
  constructor(private repository: IProblemRepository) {}
  execute(params: CreateProblemParams): Promise<Either<Failure, Problem>> {
    return this.repository.createProblem(params);
  }
}
