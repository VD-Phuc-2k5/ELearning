export interface SubmissionResultDomain {
  id: string;
  submissionId: string;
  testCaseId: string;
  status:
    | 'accepted'
    | 'wrong_answer'
    | 'time_limit_exceeded'
    | 'runtime_error'
    | 'memory_limit_exceeded';
  actualOutput: string | null;
  executionTimeMs: number | null;
  memoryUsedKb: number | null;
  errorMessage: string | null;
  createdAt: Date;
}
