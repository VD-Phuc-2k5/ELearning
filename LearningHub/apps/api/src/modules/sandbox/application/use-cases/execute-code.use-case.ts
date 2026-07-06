import { Inject, Injectable } from '@nestjs/common';
import { Either, Failure, Usecase, right } from '@learning-hub/core';
import { ExecutionResult } from '../../domain/entities/execution-result';
import { CodeExecution } from '../../domain/entities/code-execution.domain';
import { ICodeExecutionRepository } from '../../domain/repositories/i-code-execution.repository';
import { ISandboxService } from '../interfaces/i-sandbox.service';
import { ExecuteCodeDto } from '../dto/execute-code.dto';
import * as crypto from 'crypto';

@Injectable()
export class ExecuteCodeUseCase
  implements Usecase<ExecutionResult, { dto: ExecuteCodeDto; userId: string }>
{
  constructor(
    @Inject('ISandboxService')
    private readonly sandboxService: ISandboxService,
    @Inject('ICodeExecutionRepository')
    private readonly repository: ICodeExecutionRepository,
  ) {}

  async execute(params: {
    dto: ExecuteCodeDto;
    userId: string;
  }): Promise<Either<Failure, ExecutionResult>> {
    const { dto, userId } = params;

    // Run code in isolated docker container
    const result = await this.sandboxService.execute({
      language: dto.language,
      sourceCode: dto.sourceCode,
      stdin: dto.stdin,
      timeoutMs: process.env.SANDBOX_TIMEOUT_MS
        ? Number(process.env.SANDBOX_TIMEOUT_MS)
        : 10000,
      memoryLimitMb: process.env.SANDBOX_MEMORY_LIMIT_MB
        ? Number(process.env.SANDBOX_MEMORY_LIMIT_MB)
        : 64,
    });

    // Save history in repository
    const codeExecution = new CodeExecution(
      crypto.randomUUID(),
      userId,
      dto.language,
      dto.sourceCode,
      dto.stdin || null,
      result.stdout || null,
      result.stderr || null,
      result.exitCode,
      result.status,
      result.executionTimeMs,
      result.memoryUsedBytes,
      new Date(),
    );

    await this.repository.save(codeExecution);

    return right(result);
  }
}
