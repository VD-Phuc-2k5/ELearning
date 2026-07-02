import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { FORUM_INVITE_CLEANUP_QUEUE_NAME } from './queue-names';

@Injectable()
export class InviteCleanupInitializer implements OnModuleInit {
  private readonly logger = new Logger(InviteCleanupInitializer.name);

  constructor(
    @InjectQueue(FORUM_INVITE_CLEANUP_QUEUE_NAME)
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
    this.logger.log('Registered invite cleanup job (every 2 minutes)');
  }
}
