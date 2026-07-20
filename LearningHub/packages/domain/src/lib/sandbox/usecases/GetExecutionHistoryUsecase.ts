import { Either, Failure, Usecase } from '@learning-hub/core';
import { ISandboxRepository } from '../repositories/ISandboxRepository';
import { CodeExecution } from '../entities/entities';

export class GetExecutionHistoryUsecase
  implements Usecase<CodeExecution[], { limit?: number } | undefined>
{
  constructor(private repository: ISandboxRepository) {}
  async execute(params?: {
    limit?: number;
  }): Promise<Either<Failure, CodeExecution[]>> {
    return this.repository.getHistory(params?.limit);
  }
}
