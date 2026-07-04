import { Inject, Injectable } from '@nestjs/common';
import { Either, Failure, Usecase, right } from '@learning-hub/core';
import { CodeExecution } from '../../domain/entities/code-execution.domain';
import { ICodeExecutionRepository } from '../../domain/repositories/i-code-execution.repository';

@Injectable()
export class GetExecutionHistoryUseCase
  implements Usecase<CodeExecution[], { userId: string; limit?: number }>
{
  constructor(
    @Inject('ICodeExecutionRepository')
    private readonly repository: ICodeExecutionRepository,
  ) {}

  async execute(params: {
    userId: string;
    limit?: number;
  }): Promise<Either<Failure, CodeExecution[]>> {
    const history = await this.repository.findByUserId(
      params.userId,
      params.limit,
    );
    return right(history);
  }
}
