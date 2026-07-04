import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { JUDGE_QUEUE, JudgeJobData } from './judge.queue';
import { JudgeService } from '../../application/services/judge.service';

@Processor(JUDGE_QUEUE, { concurrency: 10 })
export class JudgeProcessor extends WorkerHost {
  private readonly logger = new Logger(JudgeProcessor.name);

  constructor(private readonly judgeService: JudgeService) {
    super();
  }

  async process(job: Job<JudgeJobData>): Promise<void> {
    const { submissionId } = job.data;
    this.logger.log(
      `Start processing judge job for submission: ${submissionId}`,
    );
    try {
      await this.judgeService.judge(submissionId);
      this.logger.log(
        `Successfully completed judge job for submission: ${submissionId}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to process judge job for submission ${submissionId}:`,
        err,
      );
      throw err;
    }
  }
}
