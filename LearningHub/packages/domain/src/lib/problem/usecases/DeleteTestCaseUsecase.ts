import { Either, Failure, Usecase } from '@learning-hub/core';
import { IProblemRepository } from '../repositories/IProblemRepository';

export class DeleteTestCaseParams {
  constructor(
    public problemId: string,
    public id: string,
  ) {}
}

export class DeleteTestCaseUsecase
  implements Usecase<void, DeleteTestCaseParams>
{
  constructor(private repository: IProblemRepository) {}
  execute(params: DeleteTestCaseParams): Promise<Either<Failure, void>> {
    return this.repository.deleteTestCase(params.problemId, params.id);
  }
}
