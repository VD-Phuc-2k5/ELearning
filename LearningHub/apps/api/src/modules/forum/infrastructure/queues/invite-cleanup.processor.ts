import { Inject, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  FORUM_INVITE_REPOSITORY,
  IForumInviteRepository,
} from '../../domain/repositories/forum-invite.repository.interface';
import { FORUM_INVITE_CLEANUP_QUEUE_NAME } from './queue-names';

@Processor(FORUM_INVITE_CLEANUP_QUEUE_NAME)
export class InviteCleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(InviteCleanupProcessor.name);

  constructor(
    @Inject(FORUM_INVITE_REPOSITORY)
    private readonly inviteRepo: IForumInviteRepository,
  ) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    if (job.name === 'cleanup') {
      try {
        const deleted = await this.inviteRepo.deleteClosed();
        if (deleted > 0) {
          this.logger.log(`Cleaned up ${deleted} closed/expired invites`);
        }
        return { deleted };
      } catch (err) {
        this.logger.error('Invite cleanup failed', err);
        throw err;
      }
    }
    return { skipped: true };
  }
}
