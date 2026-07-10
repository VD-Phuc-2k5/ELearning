export interface Problem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly difficulty: 'easy' | 'medium' | 'hard';
  readonly timeLimitMs: number;
  readonly memoryLimitMb: number;
  readonly sampleInput: string | null;
  readonly sampleOutput: string | null;
  readonly languages: string[];
  readonly status: 'draft' | 'public';
  readonly templates?: Record<string, string>;
  readonly wrappers?: Record<string, string>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TestCase {
  readonly id: string;
  readonly problemId: string;
  readonly input: string;
  readonly expectedOutput: string;
  readonly isHidden: boolean;
  readonly points: number;
  readonly orderIndex: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Submission {
  readonly id: string;
  readonly problemId: string;
  readonly userId: string;
  readonly language: string;
  readonly sourceCode: string;
  readonly status:
    | 'queued'
    | 'running'
    | 'accepted'
    | 'wrong_answer'
    | 'time_limit_exceeded'
    | 'compilation_error'
    | 'runtime_error'
    | 'memory_limit_exceeded';
  readonly score: number;
  readonly errorMessage: string | null;
  readonly totalTestCases: number;
  readonly passedTestCases: number;
  readonly executionTimeMs: number | null;
  readonly memoryUsedKb: number | null;
  readonly results?: unknown[];
  readonly submittedAt: string;
  readonly judgedAt: string | null;
}

export interface CreateProblemParams {
  readonly title: string;
  readonly description: string;
  readonly difficulty: 'easy' | 'medium' | 'hard';
  readonly timeLimitMs: number;
  readonly memoryLimitMb: number;
  readonly sampleInput: string | null;
  readonly sampleOutput: string | null;
  readonly languages: string[];
  readonly templates?: Record<string, string>;
  readonly wrappers?: Record<string, string>;
}

export interface UpdateProblemParams {
  readonly title?: string;
  readonly description?: string;
  readonly difficulty?: 'easy' | 'medium' | 'hard';
  readonly timeLimitMs?: number;
  readonly memoryLimitMb?: number;
  readonly sampleInput?: string | null;
  readonly sampleOutput?: string | null;
  readonly languages?: string[];
  readonly templates?: Record<string, string>;
  readonly wrappers?: Record<string, string>;
  readonly status?: 'draft' | 'public';
}

export interface CreateTestCaseParams {
  readonly input: string;
  readonly expectedOutput: string;
  readonly isHidden?: boolean;
  readonly points?: number;
  readonly orderIndex?: number;
}

export interface UpdateTestCaseParams {
  readonly input?: string;
  readonly expectedOutput?: string;
  readonly isHidden?: boolean;
  readonly points?: number;
  readonly orderIndex?: number;
}

export interface SampleTestCase {
  readonly input: string;
  readonly expectedOutput: string;
}

export interface SubmitCodeParams {
  readonly language: string;
  readonly sourceCode: string;
}
