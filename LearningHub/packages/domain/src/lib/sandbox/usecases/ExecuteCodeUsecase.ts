import { Either, Failure, Usecase } from '@learning-hub/core';
import { ISandboxRepository } from '../repositories/ISandboxRepository';
import { ExecuteCodeParams, ExecutionResult } from '../entities/entities';

export class ExecuteCodeUsecase
  implements Usecase<ExecutionResult, ExecuteCodeParams>
{
  constructor(private repository: ISandboxRepository) {}
  async execute(
    params: ExecuteCodeParams,
  ): Promise<Either<Failure, ExecutionResult>> {
    return this.repository.executeCode(params);
  }
}
