import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { FORUM_REPORT_CLEANUP_QUEUE_NAME } from './queue-names';

@Injectable()
export class ReportCleanupInitializer implements OnModuleInit {
  private readonly logger = new Logger(ReportCleanupInitializer.name);

  constructor(
    @InjectQueue(FORUM_REPORT_CLEANUP_QUEUE_NAME)
    private readonly cleanupQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.cleanupQueue.add(
      'cleanup',
      {},
      {
        repeat: { pattern: '*/2 * * * *' },
        removeOnComplete: true,
        removeOnFail: 50,
      },
    );
    this.logger.log('Registered report cleanup job (every 2 minutes)');
  }
}
