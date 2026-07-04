import { CodeExecution } from '../entities/code-execution.domain';

export interface ICodeExecutionRepository {
  save(execution: CodeExecution): Promise<CodeExecution>;
  findByUserId(userId: string, limit?: number): Promise<CodeExecution[]>;
}
