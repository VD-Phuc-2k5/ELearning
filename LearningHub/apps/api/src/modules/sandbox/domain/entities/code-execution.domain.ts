export class CodeExecution {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly language: string,
    public readonly sourceCode: string,
    public readonly stdin: string | null,
    public readonly stdout: string | null,
    public readonly stderr: string | null,
    public readonly exitCode: number | null,
    public readonly status: 'success' | 'error' | 'timeout' | 'memory_limit',
    public readonly executionTimeMs: number | null,
    public readonly memoryUsedBytes: number | null,
    public readonly createdAt: Date,
  ) {}
}
