/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { JudgeService } from './judge.service';
import { ISubmissionRepository } from '../../domain/repositories/submission.repository.interface';
import { ICodingProblemRepository } from '../../domain/repositories/coding-problem.repository.interface';
import { ITestCaseRepository } from '../../domain/repositories/test-case.repository.interface';
import { ISandboxService } from '../../../sandbox/application/interfaces/i-sandbox.service';
import { SubmissionDomain } from '../../domain/entities/submission.domain';
import { CodingProblemDomain } from '../../domain/entities/coding-problem.domain';
import { TestCaseDomain } from '../../domain/entities/test-case.domain';
import { ExecutionResult } from '../../../sandbox/domain/entities/execution-result';

const makeSubmission = (
  overrides: Partial<SubmissionDomain> = {},
): SubmissionDomain => ({
  id: 'sub-1',
  userId: 'user-1',
  problemId: 'prob-1',
  language: 'python',
  sourceCode: 'print(1+1)',
  status: 'queued',
  score: 0,
  totalTestCases: 0,
  passedTestCases: 0,
  executionTimeMs: null,
  memoryUsedKb: null,
  errorMessage: null,
  submittedAt: new Date(),
  judgedAt: null,
  ...overrides,
});

const makeProblem = (
  overrides: Partial<CodingProblemDomain> = {},
): CodingProblemDomain => ({
  id: 'prob-1',
  title: 'Sum',
  description: 'Add two numbers',
  difficulty: 'easy',
  timeLimitMs: 1000,
  memoryLimitMb: 256,
  sampleInput: null,
  sampleOutput: null,
  languages: ['python'],
  templates: {},
  wrappers: {},
  status: 'draft',
  creatorId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeTestCase = (
  overrides: Partial<TestCaseDomain> = {},
): TestCaseDomain => ({
  id: 'tc-1',
  problemId: 'prob-1',
  input: '1 2',
  expectedOutput: '3',
  isHidden: false,
  orderIndex: 1,
  points: 10,
  createdAt: new Date(),
  ...overrides,
});

const makeExecution = (
  overrides: Partial<ExecutionResult> = {},
): ExecutionResult => ({
  status: 'success',
  stdout: '3\n',
  stderr: '',
  exitCode: 0,
  executionTimeMs: 50,
  memoryUsedBytes: 10240,
  ...overrides,
});

describe('JudgeService', () => {
  let service: JudgeService;
  let submissionRepo: jest.Mocked<ISubmissionRepository>;
  let problemRepo: jest.Mocked<ICodingProblemRepository>;
  let testCaseRepo: jest.Mocked<ITestCaseRepository>;
  let sandboxService: jest.Mocked<ISandboxService>;

  beforeEach(() => {
    submissionRepo = {
      create: jest.fn(),
      updateStatus: jest.fn(),
      updateResult: jest.fn(),
      findById: jest.fn(),
      findByUserIdAndProblemId: jest.fn(),
    };
    problemRepo = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      countByProblemId: jest.fn(),
    };
    testCaseRepo = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findByProblemId: jest.fn(),
    };
    sandboxService = {
      execute: jest.fn(),
      ping: jest.fn(),
    };

    service = new JudgeService(
      submissionRepo,
      problemRepo,
      testCaseRepo,
      sandboxService,
    );
  });

  describe('judge()', () => {
    it('should do nothing when submission not found', async () => {
      submissionRepo.findById.mockResolvedValue(null);

      await service.judge('nonexistent');

      expect(submissionRepo.updateStatus).not.toHaveBeenCalled();
    });

    it('should mark compilation_error when problem not found', async () => {
      submissionRepo.findById.mockResolvedValue(makeSubmission());
      problemRepo.findById.mockResolvedValue(null);

      await service.judge('sub-1');

      expect(submissionRepo.updateStatus).toHaveBeenCalledWith(
        'sub-1',
        'compilation_error',
        'Problem details not found',
      );
    });

    it('should mark compilation_error when no test cases exist', async () => {
      submissionRepo.findById.mockResolvedValue(makeSubmission());
      problemRepo.findById.mockResolvedValue(makeProblem());
      testCaseRepo.findByProblemId.mockResolvedValue([]);

      await service.judge('sub-1');

      expect(submissionRepo.updateStatus).toHaveBeenCalledWith(
        'sub-1',
        'compilation_error',
        'No test cases configured for this problem',
      );
    });

    it('should set verdict to accepted when all test cases pass', async () => {
      const submission = makeSubmission();
      const problem = makeProblem();
      const tc1 = makeTestCase({ id: 'tc-1', points: 10 });
      const tc2 = makeTestCase({
        id: 'tc-2',
        points: 5,
        expectedOutput: 'hello',
      });

      submissionRepo.findById.mockResolvedValue(submission);
      problemRepo.findById.mockResolvedValue(problem);
      testCaseRepo.findByProblemId.mockResolvedValue([tc1, tc2]);
      sandboxService.execute
        .mockResolvedValueOnce(makeExecution({ stdout: '3\n' }))
        .mockResolvedValueOnce(
          makeExecution({ stdout: 'hello\n', executionTimeMs: 120 }),
        );

      await service.judge('sub-1');

      expect(submissionRepo.updateStatus).toHaveBeenCalledWith(
        'sub-1',
        'running',
      );
      expect(submissionRepo.updateResult).toHaveBeenCalledWith('sub-1', {
        status: 'accepted',
        score: 15,
        passedTestCases: 2,
        totalTestCases: 2,
        executionTimeMs: 120,
        memoryUsedKb: 10,
        errorMessage: null,
        results: [
          expect.objectContaining({ testCaseId: 'tc-1', status: 'accepted' }),
          expect.objectContaining({ testCaseId: 'tc-2', status: 'accepted' }),
        ],
      });
    });

    it('should set verdict to wrong_answer when output mismatches', async () => {
      submissionRepo.findById.mockResolvedValue(makeSubmission());
      problemRepo.findById.mockResolvedValue(makeProblem());
      testCaseRepo.findByProblemId.mockResolvedValue([
        makeTestCase({ expectedOutput: '42' }),
      ]);
      sandboxService.execute.mockResolvedValue(
        makeExecution({ stdout: '99\n' }),
      );

      await service.judge('sub-1');

      expect(submissionRepo.updateResult).toHaveBeenCalledWith(
        'sub-1',
        expect.objectContaining({
          status: 'wrong_answer',
          passedTestCases: 0,
          score: 0,
        }),
      );
    });

    it('should normalize line endings before comparing output', async () => {
      submissionRepo.findById.mockResolvedValue(makeSubmission());
      problemRepo.findById.mockResolvedValue(makeProblem());
      testCaseRepo.findByProblemId.mockResolvedValue([
        makeTestCase({ expectedOutput: 'line1\r\nline2' }),
      ]);
      sandboxService.execute.mockResolvedValue(
        makeExecution({ stdout: 'line1\nline2\n' }),
      );

      await service.judge('sub-1');

      expect(submissionRepo.updateResult).toHaveBeenCalledWith(
        'sub-1',
        expect.objectContaining({ status: 'accepted', passedTestCases: 1 }),
      );
    });

    it('should treat outputs as equal after normalizing all whitespace', async () => {
      submissionRepo.findById.mockResolvedValue(makeSubmission());
      problemRepo.findById.mockResolvedValue(makeProblem());
      testCaseRepo.findByProblemId.mockResolvedValue([
        makeTestCase({ expectedOutput: '[ 0, 1 ]' }),
      ]);
      sandboxService.execute.mockResolvedValue(
        makeExecution({ stdout: '[0, 1]\n' }),
      );

      await service.judge('sub-1');

      expect(submissionRepo.updateResult).toHaveBeenCalledWith(
        'sub-1',
        expect.objectContaining({ status: 'accepted', passedTestCases: 1 }),
      );
    });

    it('should set verdict to time_limit_exceeded on timeout', async () => {
      submissionRepo.findById.mockResolvedValue(makeSubmission());
      problemRepo.findById.mockResolvedValue(makeProblem());
      testCaseRepo.findByProblemId.mockResolvedValue([makeTestCase()]);
      sandboxService.execute.mockResolvedValue(
        makeExecution({ status: 'timeout' }),
      );

      await service.judge('sub-1');

      expect(submissionRepo.updateResult).toHaveBeenCalledWith(
        'sub-1',
        expect.objectContaining({ status: 'time_limit_exceeded' }),
      );
    });

    it('should set verdict to memory_limit_exceeded', async () => {
      submissionRepo.findById.mockResolvedValue(makeSubmission());
      problemRepo.findById.mockResolvedValue(makeProblem());
      testCaseRepo.findByProblemId.mockResolvedValue([makeTestCase()]);
      sandboxService.execute.mockResolvedValue(
        makeExecution({ status: 'memory_limit' }),
      );

      await service.judge('sub-1');

      expect(submissionRepo.updateResult).toHaveBeenCalledWith(
        'sub-1',
        expect.objectContaining({ status: 'memory_limit_exceeded' }),
      );
    });

    it('should set verdict to runtime_error on non-compile error', async () => {
      submissionRepo.findById.mockResolvedValue(
        makeSubmission({ language: 'python' }),
      );
      problemRepo.findById.mockResolvedValue(makeProblem());
      testCaseRepo.findByProblemId.mockResolvedValue([makeTestCase()]);
      sandboxService.execute.mockResolvedValue(
        makeExecution({
          status: 'error',
          stderr: 'NameError: name x not defined',
        }),
      );

      await service.judge('sub-1');

      expect(submissionRepo.updateResult).toHaveBeenCalledWith(
        'sub-1',
        expect.objectContaining({ status: 'runtime_error' }),
      );
    });

    it('should detect compilation error for C language on first test case', async () => {
      submissionRepo.findById.mockResolvedValue(
        makeSubmission({ language: 'c' }),
      );
      problemRepo.findById.mockResolvedValue(makeProblem());
      testCaseRepo.findByProblemId.mockResolvedValue([
        makeTestCase(),
        makeTestCase({ id: 'tc-2' }),
      ]);
      sandboxService.execute.mockResolvedValue(
        makeExecution({ status: 'error', stderr: 'error: expected ; before' }),
      );

      await service.judge('sub-1');

      expect(submissionRepo.updateStatus).toHaveBeenCalledWith(
        'sub-1',
        'compilation_error',
        expect.stringContaining('error:'),
      );
      expect(sandboxService.execute).toHaveBeenCalledTimes(1);
    });

    it('should treat error on second test case as runtime_error not compile', async () => {
      submissionRepo.findById.mockResolvedValue(
        makeSubmission({ language: 'c' }),
      );
      problemRepo.findById.mockResolvedValue(makeProblem());
      testCaseRepo.findByProblemId.mockResolvedValue([
        makeTestCase({ id: 'tc-1', expectedOutput: 'ok' }),
        makeTestCase({ id: 'tc-2' }),
      ]);
      sandboxService.execute
        .mockResolvedValueOnce(makeExecution({ stdout: 'ok\n' }))
        .mockResolvedValueOnce(
          makeExecution({ status: 'error', stderr: 'error: something' }),
        );

      await service.judge('sub-1');

      expect(submissionRepo.updateResult).toHaveBeenCalledWith(
        'sub-1',
        expect.objectContaining({
          status: 'runtime_error',
          passedTestCases: 1,
        }),
      );
    });

    describe('isCompileError()', () => {
      it('should return false for empty stderr', () => {
        expect((service as any).isCompileError('c', '')).toBe(false);
      });

      it.each([
        ['c', 'error: syntax error'],
        ['cpp', 'error: expected ;'],
        ['cpp', 'g++: fatal error'],
        ['java', 'error: cannot find symbol'],
        ['java', 'javac: file not found'],
        ['rust', 'error[E0425]: cannot find value'],
        ['rust', 'error: aborting due to'],
        ['go', 'go: cannot find package'],
        ['go', 'undefined: foo'],
        ['csharp', 'error CS1001: Identifier expected'],
      ])('should detect compile error for %s: %s', (lang, stderr) => {
        expect((service as any).isCompileError(lang, stderr)).toBe(true);
      });

      it('should return false for unsupported language', () => {
        expect((service as any).isCompileError('python', 'some error')).toBe(
          false,
        );
      });
    });

    it('should use wrapper with {{STUDENT_CODE}} placeholder', async () => {
      submissionRepo.findById.mockResolvedValue(
        makeSubmission({ sourceCode: 'x = 5' }),
      );
      problemRepo.findById.mockResolvedValue(
        makeProblem({
          wrappers: { python: 'def run():\n{{STUDENT_CODE}}\nrun()' },
        }),
      );
      testCaseRepo.findByProblemId.mockResolvedValue([makeTestCase()]);
      sandboxService.execute.mockResolvedValue(makeExecution());

      await service.judge('sub-1');

      expect(sandboxService.execute).toHaveBeenCalledWith(
        expect.objectContaining({ sourceCode: 'def run():\nx = 5\nrun()' }),
      );
    });

    it('should append wrapper when no placeholder found', async () => {
      submissionRepo.findById.mockResolvedValue(
        makeSubmission({ sourceCode: 'x = 5' }),
      );
      problemRepo.findById.mockResolvedValue(
        makeProblem({
          wrappers: { python: 'print(x)' },
        }),
      );
      testCaseRepo.findByProblemId.mockResolvedValue([makeTestCase()]);
      sandboxService.execute.mockResolvedValue(makeExecution());

      await service.judge('sub-1');

      expect(sandboxService.execute).toHaveBeenCalledWith(
        expect.objectContaining({ sourceCode: 'x = 5\n\nprint(x)' }),
      );
    });

    it('should use raw sourceCode when no wrapper configured for language', async () => {
      submissionRepo.findById.mockResolvedValue(
        makeSubmission({ sourceCode: 'print(1)', language: 'python' }),
      );
      problemRepo.findById.mockResolvedValue(makeProblem({ wrappers: {} }));
      testCaseRepo.findByProblemId.mockResolvedValue([makeTestCase()]);
      sandboxService.execute.mockResolvedValue(makeExecution());

      await service.judge('sub-1');

      expect(sandboxService.execute).toHaveBeenCalledWith(
        expect.objectContaining({ sourceCode: 'print(1)' }),
      );
    });

    it('should pass problem timeLimitMs and memoryLimitMb to sandbox', async () => {
      submissionRepo.findById.mockResolvedValue(makeSubmission());
      problemRepo.findById.mockResolvedValue(
        makeProblem({ timeLimitMs: 2000, memoryLimitMb: 512 }),
      );
      testCaseRepo.findByProblemId.mockResolvedValue([makeTestCase()]);
      sandboxService.execute.mockResolvedValue(makeExecution());

      await service.judge('sub-1');

      expect(sandboxService.execute).toHaveBeenCalledWith(
        expect.objectContaining({ timeoutMs: 2000, memoryLimitMb: 512 }),
      );
    });

    it('should track max execution time and memory across test cases', async () => {
      submissionRepo.findById.mockResolvedValue(makeSubmission());
      problemRepo.findById.mockResolvedValue(makeProblem());
      testCaseRepo.findByProblemId.mockResolvedValue([
        makeTestCase({ id: 'tc-1', points: 5 }),
        makeTestCase({ id: 'tc-2', points: 5 }),
      ]);
      sandboxService.execute
        .mockResolvedValueOnce(
          makeExecution({ executionTimeMs: 50, memoryUsedBytes: 10240 }),
        )
        .mockResolvedValueOnce(
          makeExecution({ executionTimeMs: 200, memoryUsedBytes: 5120 }),
        );

      await service.judge('sub-1');

      expect(submissionRepo.updateResult).toHaveBeenCalledWith(
        'sub-1',
        expect.objectContaining({ executionTimeMs: 200, memoryUsedKb: 10 }),
      );
    });

    it('should calculate score sum from passed test cases only', async () => {
      submissionRepo.findById.mockResolvedValue(makeSubmission());
      problemRepo.findById.mockResolvedValue(makeProblem());
      testCaseRepo.findByProblemId.mockResolvedValue([
        makeTestCase({ id: 'tc-1', points: 10, expectedOutput: 'yes' }),
        makeTestCase({ id: 'tc-2', points: 5, expectedOutput: 'no' }),
        makeTestCase({ id: 'tc-3', points: 20, expectedOutput: 'maybe' }),
      ]);
      sandboxService.execute
        .mockResolvedValueOnce(makeExecution({ stdout: 'yes\n' }))
        .mockResolvedValueOnce(makeExecution({ stdout: 'WRONG\n' }))
        .mockResolvedValueOnce(makeExecution({ stdout: 'maybe\n' }));

      await service.judge('sub-1');

      expect(submissionRepo.updateResult).toHaveBeenCalledWith(
        'sub-1',
        expect.objectContaining({
          status: 'wrong_answer',
          score: 30,
          passedTestCases: 2,
          totalTestCases: 3,
        }),
      );
    });

    it('should handle empty stdout (no output)', async () => {
      submissionRepo.findById.mockResolvedValue(makeSubmission());
      problemRepo.findById.mockResolvedValue(makeProblem());
      testCaseRepo.findByProblemId.mockResolvedValue([
        makeTestCase({ expectedOutput: '' }),
      ]);
      sandboxService.execute.mockResolvedValue(makeExecution({ stdout: '' }));

      await service.judge('sub-1');

      expect(submissionRepo.updateResult).toHaveBeenCalledWith(
        'sub-1',
        expect.objectContaining({ status: 'accepted', passedTestCases: 1 }),
      );
    });

    it('should handle null/undefined memoryUsedBytes', async () => {
      submissionRepo.findById.mockResolvedValue(makeSubmission());
      problemRepo.findById.mockResolvedValue(makeProblem());
      testCaseRepo.findByProblemId.mockResolvedValue([makeTestCase()]);
      sandboxService.execute.mockResolvedValue(
        makeExecution({ memoryUsedBytes: null }),
      );

      await service.judge('sub-1');

      expect(submissionRepo.updateResult).toHaveBeenCalledWith(
        'sub-1',
        expect.objectContaining({ memoryUsedKb: 0 }),
      );
    });
  });
});
