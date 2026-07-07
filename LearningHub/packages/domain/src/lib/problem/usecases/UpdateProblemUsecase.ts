import { Either, Failure, Usecase } from '@learning-hub/core';
import { IProblemRepository } from '../repositories/IProblemRepository';
import { Problem, UpdateProblemParams } from '../entities/entities';

export class UpdateProblemParamsWithId {
  constructor(
    public id: string,
    public data: UpdateProblemParams,
  ) {}
}

export class UpdateProblemUsecase
  implements Usecase<Problem, UpdateProblemParamsWithId>
{
  constructor(private repository: IProblemRepository) {}
  execute(
    params: UpdateProblemParamsWithId,
  ): Promise<Either<Failure, Problem>> {
    return this.repository.updateProblem(params.id, params.data);
  }
}
