import { Either, Failure, Usecase } from '@learning-hub/core';
import { IProblemRepository } from '../repositories/IProblemRepository';
import { TestCase } from '../entities/entities';

export class GetTestCasesUsecase implements Usecase<TestCase[], string> {
  constructor(private repository: IProblemRepository) {}
  execute(problemId: string): Promise<Either<Failure, TestCase[]>> {
    return this.repository.getTestCases(problemId);
  }
}
