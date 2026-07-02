import { Inject, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import {
  FORUM_REPORT_REPOSITORY,
  IForumReportRepository,
} from '../../domain/repositories/forum-report.repository.interface';
import { FORUM_REPORT_CLEANUP_QUEUE_NAME } from './queue-names';

@Processor(FORUM_REPORT_CLEANUP_QUEUE_NAME)
export class ReportCleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportCleanupProcessor.name);

  constructor(
    @Inject(FORUM_REPORT_REPOSITORY)
    private readonly reportRepo: IForumReportRepository,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    if (job.name === 'cleanup') {
      try {
        const delayMinutes = this.config.get<number>(
          'REPORT_CLEANUP_DELAY_MINUTES',
          1,
        );
        const cutoff = new Date(Date.now() - delayMinutes * 60 * 1000);
        const deleted = await this.reportRepo.deleteResolvedBefore(cutoff);
        if (deleted > 0) {
          this.logger.log(
            `Cleaned up ${deleted} resolved/dismissed reports older than ${delayMinutes} min`,
          );
        }
        return { deleted };
      } catch (err) {
        this.logger.error('Report cleanup failed', err);
        throw err;
      }
    }
    return { skipped: true };
  }
}
