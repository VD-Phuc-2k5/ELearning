import { Either, Failure } from '@learning-hub/core';
import {
  CodeExecution,
  ExecuteCodeParams,
  ExecutionResult,
} from '../entities/entities';

export interface ISandboxRepository {
  executeCode(
    params: ExecuteCodeParams,
  ): Promise<Either<Failure, ExecutionResult>>;
  getHistory(limit?: number): Promise<Either<Failure, CodeExecution[]>>;
}
