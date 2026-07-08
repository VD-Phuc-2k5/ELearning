import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  SUBMISSION_REPOSITORY,
  ISubmissionRepository,
} from '../../domain/repositories/submission.repository.interface';
import {
  CODING_PROBLEM_REPOSITORY,
  ICodingProblemRepository,
} from '../../domain/repositories/coding-problem.repository.interface';
import {
  TEST_CASE_REPOSITORY,
  ITestCaseRepository,
} from '../../domain/repositories/test-case.repository.interface';
import { ISandboxService } from '../../../sandbox/application/interfaces/i-sandbox.service';
import { SubmissionStatus } from '../../domain/entities/submission.domain';
import { SubmissionResultDomain } from '../../domain/entities/submission-result.domain';

@Injectable()
export class JudgeService {
  private readonly logger = new Logger(JudgeService.name);

  constructor(
    @Inject(SUBMISSION_REPOSITORY)
    private readonly submissionRepo: ISubmissionRepository,
    @Inject(CODING_PROBLEM_REPOSITORY)
    private readonly problemRepo: ICodingProblemRepository,
    @Inject(TEST_CASE_REPOSITORY)
    private readonly testCaseRepo: ITestCaseRepository,
    @Inject('ISandboxService')
    private readonly sandboxService: ISandboxService,
  ) {}

  private isCompileError(language: string, stderr: string): boolean {
    if (!stderr) return false;
    const lowerStderr = stderr.toLowerCase();

    // Check common compiler errors
    switch (language) {
      case 'c':
      case 'cpp':
        return (
          lowerStderr.includes('error:') ||
          lowerStderr.includes('gcc') ||
          lowerStderr.includes('g++')
        );
      case 'java':
        return lowerStderr.includes('error:') || lowerStderr.includes('javac');
      case 'rust':
        return (
          lowerStderr.includes('error[e') ||
          lowerStderr.includes('error: aborting')
        );
      case 'go':
        return (
          lowerStderr.includes('go:') ||
          lowerStderr.includes('compile') ||
          lowerStderr.includes('undefined')
        );
      case 'csharp':
        return lowerStderr.includes('error cs');
      default:
        return false;
    }
  }

  async judge(submissionId: string): Promise<void> {
    const submission = await this.submissionRepo.findById(submissionId);
    if (!submission) {
      this.logger.error(`Submission not found: ${submissionId}`);
      return;
    }

    // 1. Update status to 'running'
    await this.submissionRepo.updateStatus(submissionId, 'running');

    const problem = await this.problemRepo.findById(submission.problemId);
    if (!problem) {
      this.logger.error(
        `Problem not found: ${submission.problemId} for submission ${submissionId}`,
      );
      await this.submissionRepo.updateStatus(
        submissionId,
        'compilation_error',
        'Problem details not found',
      );
      return;
    }

    const testCases = await this.testCaseRepo.findByProblemId(
      submission.problemId,
    );
    if (testCases.length === 0) {
      this.logger.error(
        `No test cases found for problem: ${submission.problemId}`,
      );
      await this.submissionRepo.updateStatus(
        submissionId,
        'compilation_error',
        'No test cases configured for this problem',
      );
      return;
    }

    let passedCount = 0;
    let totalScore = 0;
    let maxTimeMs = 0;
    let maxMemoryKb = 0;
    let finalVerdict: SubmissionStatus = 'accepted';
    let firstFailedResult: SubmissionStatus | null = null;
    let compileErrorMessage: string | null = null;

    const results: Omit<
      SubmissionResultDomain,
      'id' | 'submissionId' | 'createdAt'
    >[] = [];

    // Run test cases sequentially
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];

      // Get the driver wrapper code if configured
      let finalCode = submission.sourceCode;
      const wrapperCode = problem.wrappers?.[submission.language];
      if (wrapperCode) {
        if (wrapperCode.includes('{{STUDENT_CODE}}')) {
          finalCode = wrapperCode.replace(
            '{{STUDENT_CODE}}',
            submission.sourceCode,
          );
        } else {
          finalCode = `${submission.sourceCode}\n\n${wrapperCode}`;
        }
      }

      const execution = await this.sandboxService.execute({
        language: submission.language,
        sourceCode: finalCode,
        stdin: tc.input,
        timeoutMs: problem.timeLimitMs,
        memoryLimitMb: problem.memoryLimitMb,
      });

      let status:
        | 'accepted'
        | 'wrong_answer'
        | 'time_limit_exceeded'
        | 'runtime_error'
        | 'memory_limit_exceeded' = 'accepted';
      const cleanStderr = execution.stderr ? execution.stderr.trim() : '';

      // Determine verdict for the test case
      if (execution.status === 'timeout') {
        status = 'time_limit_exceeded';
      } else if (execution.status === 'memory_limit') {
        status = 'memory_limit_exceeded';
      } else if (execution.status === 'error') {
        // If it's a compiler language and compilation failed (first test case)
        if (
          i === 0 &&
          this.isCompileError(submission.language, execution.stderr)
        ) {
          compileErrorMessage = execution.stderr;
          finalVerdict = 'compilation_error';
          break; // Stop execution on compilation error
        }
        status = 'runtime_error';
      } else {
        // Successful execution, compare stdout
        const expected = tc.expectedOutput.replace(/\r\n/g, '\n').trim();
        const actual = execution.stdout.replace(/\r\n/g, '\n').trim();

        if (expected !== actual) {
          status = 'wrong_answer';
        }
      }

      // Record test case result
      const timeMs = execution.executionTimeMs || 0;
      const memKb = execution.memoryUsedBytes
        ? Math.round(execution.memoryUsedBytes / 1024)
        : 0;

      maxTimeMs = Math.max(maxTimeMs, timeMs);
      maxMemoryKb = Math.max(maxMemoryKb, memKb);

      if (status === 'accepted') {
        passedCount++;
        totalScore += tc.points;
      } else {
        if (!firstFailedResult) {
          firstFailedResult = status;
          finalVerdict = status; // Overall status matches the first failing verdict (e.g., TLE, WA)
        }
      }

      results.push({
        testCaseId: tc.id,
        status,
        actualOutput: execution.stdout,
        executionTimeMs: timeMs,
        memoryUsedKb: memKb,
        errorMessage: cleanStderr || null,
      });
    }

    // 2. Save result details to Database
    if (finalVerdict === 'compilation_error') {
      await this.submissionRepo.updateStatus(
        submissionId,
        'compilation_error',
        compileErrorMessage,
      );
    } else {
      await this.submissionRepo.updateResult(submissionId, {
        status: finalVerdict,
        score: totalScore,
        passedTestCases: passedCount,
        totalTestCases: testCases.length,
        executionTimeMs: maxTimeMs,
        memoryUsedKb: maxMemoryKb,
        errorMessage: null,
        results,
      });
    }
  }
}
