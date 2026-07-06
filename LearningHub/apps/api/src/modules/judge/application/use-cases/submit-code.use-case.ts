import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  SUBMISSION_REPOSITORY,
  ISubmissionRepository,
} from '../../domain/repositories/submission.repository.interface';
import {
  CODING_PROBLEM_REPOSITORY,
  ICodingProblemRepository,
} from '../../domain/repositories/coding-problem.repository.interface';
import { JUDGE_QUEUE } from '../../infrastructure/queues/judge.queue';
import { SubmissionDomain } from '../../domain/entities/submission.domain';

@Injectable()
export class SubmitCodeUseCase {
  constructor(
    @Inject(SUBMISSION_REPOSITORY)
    private readonly submissionRepo: ISubmissionRepository,
    @Inject(CODING_PROBLEM_REPOSITORY)
    private readonly problemRepo: ICodingProblemRepository,
    @InjectQueue(JUDGE_QUEUE)
    private readonly judgeQueue: Queue,
  ) {}

  async execute(
    userId: string,
    problemId: string,
    params: {
      language: string;
      sourceCode: string;
    },
  ): Promise<SubmissionDomain> {
    const problem = await this.problemRepo.findById(problemId);
    if (!problem) throw new NotFoundException('Coding problem not found');

    if (!problem.languages.includes(params.language)) {
      throw new BadRequestException(
        `Language ${params.language} is not supported for this problem`,
      );
    }

    const submission = await this.submissionRepo.create({
      userId,
      problemId,
      language: params.language,
      sourceCode: params.sourceCode,
    });

    await this.judgeQueue.add('judge-job', { submissionId: submission.id });

    return submission;
  }
}
