import {
  SubmissionDomain,
  SubmissionStatus,
} from '../entities/submission.domain';
import { SubmissionResultDomain } from '../entities/submission-result.domain';

export const SUBMISSION_REPOSITORY = 'ISubmissionRepository';

export interface ISubmissionRepository {
  create(
    submission: Omit<
      SubmissionDomain,
      | 'id'
      | 'status'
      | 'score'
      | 'totalTestCases'
      | 'passedTestCases'
      | 'executionTimeMs'
      | 'memoryUsedKb'
      | 'errorMessage'
      | 'submittedAt'
      | 'judgedAt'
    >,
  ): Promise<SubmissionDomain>;
  updateStatus(
    id: string,
    status: SubmissionStatus,
    errorMessage?: string | null,
  ): Promise<void>;
  updateResult(
    id: string,
    params: {
      status: SubmissionStatus;
      score: number;
      passedTestCases: number;
      totalTestCases: number;
      executionTimeMs: number | null;
      memoryUsedKb: number | null;
      errorMessage: string | null;
      results: Omit<
        SubmissionResultDomain,
        'id' | 'submissionId' | 'createdAt'
      >[];
    },
  ): Promise<SubmissionDomain>;
  findById(id: string): Promise<SubmissionDomain | null>;
  findByUserIdAndProblemId(
    userId: string,
    problemId: string,
    options?: { page?: number; limit?: number },
  ): Promise<{ data: SubmissionDomain[]; total: number }>;
}
