import { Either, Failure, Usecase } from '@learning-hub/core';
import { IProblemRepository } from '../repositories/IProblemRepository';
import { SampleTestCase } from '../entities/entities';

export class GetSampleTestCasesUsecase
  implements Usecase<SampleTestCase[], string>
{
  constructor(private repository: IProblemRepository) {}
  execute(problemId: string): Promise<Either<Failure, SampleTestCase[]>> {
    return this.repository.getSampleTestCases(problemId);
  }
}
