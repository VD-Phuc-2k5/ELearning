import {
  CodeExecution,
  ExecuteCodeParams,
  ExecutionResult,
} from '@learning-hub/domain';

export interface ISandboxRemoteDataSource {
  executeCode(
    params: ExecuteCodeParams,
    token?: string,
  ): Promise<ExecutionResult>;
  getHistory(limit?: number, token?: string): Promise<CodeExecution[]>;
}
