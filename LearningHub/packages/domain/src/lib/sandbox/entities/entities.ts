export interface ExecutionResult {
  readonly status: 'success' | 'error' | 'timeout' | 'memory_limit';
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number | null;
  readonly executionTimeMs: number;
  readonly memoryUsedBytes: number | null;
}

export interface CodeExecution {
  readonly id: string;
  readonly userId: string;
  readonly language: string;
  readonly sourceCode: string;
  readonly stdin: string | null;
  readonly stdout: string | null;
  readonly stderr: string | null;
  readonly exitCode: number | null;
  readonly status: 'success' | 'error' | 'timeout' | 'memory_limit';
  readonly executionTimeMs: number | null;
  readonly memoryUsedBytes: number | null;
  readonly createdAt: string;
}

export interface ExecuteCodeParams {
  readonly language: string;
  readonly sourceCode: string;
  readonly stdin?: string;
}
