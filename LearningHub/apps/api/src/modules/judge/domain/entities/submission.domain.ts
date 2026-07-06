import { SubmissionResultDomain } from './submission-result.domain';

export type SubmissionStatus =
  | 'queued'
  | 'running'
  | 'accepted'
  | 'wrong_answer'
  | 'time_limit_exceeded'
  | 'compilation_error'
  | 'runtime_error'
  | 'memory_limit_exceeded';

export interface SubmissionDomain {
  id: string;
  userId: string;
  problemId: string;
  language: string;
  sourceCode: string;
  status: SubmissionStatus;
  score: number;
  totalTestCases: number;
  passedTestCases: number;
  executionTimeMs: number | null;
  memoryUsedKb: number | null;
  errorMessage: string | null;
  results?: SubmissionResultDomain[];
  submittedAt: Date;
  judgedAt: Date | null;
}
