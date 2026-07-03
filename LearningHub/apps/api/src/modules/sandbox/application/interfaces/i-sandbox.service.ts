import { ExecutionResult } from '../../domain/entities/execution-result';

export interface ISandboxService {
  execute(params: {
    language: string;
    sourceCode: string;
    stdin?: string;
    timeoutMs?: number;
    memoryLimitMb?: number;
  }): Promise<ExecutionResult>;
}
