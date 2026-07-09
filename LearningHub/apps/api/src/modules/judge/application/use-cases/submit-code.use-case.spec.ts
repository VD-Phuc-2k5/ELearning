import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SubmitCodeUseCase } from './submit-code.use-case';
import {
  ISubmissionRepository,
  SUBMISSION_REPOSITORY,
} from '../../domain/repositories/submission.repository.interface';
import {
  ICodingProblemRepository,
  CODING_PROBLEM_REPOSITORY,
} from '../../domain/repositories/coding-problem.repository.interface';
import { JUDGE_QUEUE } from '../../infrastructure/queues/judge.queue';
import { getQueueToken } from '@nestjs/bullmq';
import { SubmissionDomain } from '../../domain/entities/submission.domain';
import { CodingProblemDomain } from '../../domain/entities/coding-problem.domain';

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
  languages: ['python', 'javascript'],
  templates: {},
  wrappers: {},
  status: 'draft',
  creatorId: 'admin-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

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

describe('SubmitCodeUseCase', () => {
  let useCase: SubmitCodeUseCase;
  let submissionRepo: jest.Mocked<ISubmissionRepository>;
  let problemRepo: jest.Mocked<ICodingProblemRepository>;
  let judgeQueue: { add: jest.Mock };

  beforeEach(async () => {
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
    judgeQueue = { add: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmitCodeUseCase,
        { provide: SUBMISSION_REPOSITORY, useValue: submissionRepo },
        { provide: CODING_PROBLEM_REPOSITORY, useValue: problemRepo },
        { provide: getQueueToken(JUDGE_QUEUE), useValue: judgeQueue },
      ],
    }).compile();

    useCase = module.get<SubmitCodeUseCase>(SubmitCodeUseCase);
  });

  it('should create submission and enqueue judge job on valid input', async () => {
    problemRepo.findById.mockResolvedValue(makeProblem());
    submissionRepo.create.mockResolvedValue(makeSubmission());
    judgeQueue.add.mockResolvedValue({ id: 'job-1' });

    const result = await useCase.execute('user-1', 'prob-1', {
      language: 'python',
      sourceCode: 'print(1)',
    });

    expect(submissionRepo.create).toHaveBeenCalledWith({
      userId: 'user-1',
      problemId: 'prob-1',
      language: 'python',
      sourceCode: 'print(1)',
    });
    expect(judgeQueue.add).toHaveBeenCalledWith('judge-job', {
      submissionId: 'sub-1',
    });
    expect(result.id).toBe('sub-1');
  });

  it('should throw NotFoundException when problem does not exist', async () => {
    problemRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('user-1', 'nonexistent', {
        language: 'python',
        sourceCode: 'print(1)',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when language is not supported', async () => {
    problemRepo.findById.mockResolvedValue(
      makeProblem({ languages: ['python'] }),
    );

    await expect(
      useCase.execute('user-1', 'prob-1', {
        language: 'java',
        sourceCode: 'System.out.println(1)',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should accept a supported language matching problem config', async () => {
    problemRepo.findById.mockResolvedValue(
      makeProblem({ languages: ['python', 'cpp'] }),
    );
    submissionRepo.create.mockResolvedValue(
      makeSubmission({ language: 'cpp' }),
    );
    judgeQueue.add.mockResolvedValue({ id: 'job-1' });

    const result = await useCase.execute('user-1', 'prob-1', {
      language: 'cpp',
      sourceCode: '#include <iostream>\nint main(){}',
    });

    expect(result.language).toBe('cpp');
  });
});
