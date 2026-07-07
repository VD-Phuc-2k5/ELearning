import { Either, Failure, Usecase } from '@learning-hub/core';
import { IProblemRepository } from '../repositories/IProblemRepository';
import { Submission, SubmitCodeParams } from '../entities/entities';

export class SubmitCodeParamsWithId {
  constructor(
    public problemId: string,
    public data: SubmitCodeParams,
  ) {}
}

export class SubmitCodeUsecase
  implements Usecase<Submission, SubmitCodeParamsWithId>
{
  constructor(private repository: IProblemRepository) {}
  execute(
    params: SubmitCodeParamsWithId,
  ): Promise<Either<Failure, Submission>> {
    return this.repository.submitCode(params.problemId, params.data);
  }
}
