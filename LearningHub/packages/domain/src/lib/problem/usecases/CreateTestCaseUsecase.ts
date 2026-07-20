import { Either, Failure, Usecase } from '@learning-hub/core';
import { IProblemRepository } from '../repositories/IProblemRepository';
import { TestCase, CreateTestCaseParams } from '../entities/entities';

export class CreateTestCaseParamsWithId {
  constructor(
    public problemId: string,
    public data: CreateTestCaseParams,
  ) {}
}

export class CreateTestCaseUsecase
  implements Usecase<TestCase, CreateTestCaseParamsWithId>
{
  constructor(private repository: IProblemRepository) {}
  execute(
    params: CreateTestCaseParamsWithId,
  ): Promise<Either<Failure, TestCase>> {
    return this.repository.createTestCase(params.problemId, params.data);
  }
}
