export interface ExecutionResult {
  status: 'success' | 'error' | 'timeout' | 'memory_limit';
  stdout: string;
  stderr: string;
  exitCode: number | null;
  executionTimeMs: number;
  memoryUsedBytes: number | null;
}
