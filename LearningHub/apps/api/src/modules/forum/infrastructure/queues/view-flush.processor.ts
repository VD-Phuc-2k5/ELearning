import { Inject, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ForumPostEntity } from '../persistence/entities/forum-post.entity';
import { FORUM_VIEWS_QUEUE_NAME } from './queue-names';

@Processor(FORUM_VIEWS_QUEUE_NAME)
export class ViewFlushProcessor extends WorkerHost {
  private readonly logger = new Logger(ViewFlushProcessor.name);
  private readonly cachePrefix = 'post:*:views';
  private readonly cacheEntryPattern = /^post:([0-9a-f-]+):views$/;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @InjectRepository(ForumPostEntity)
    private readonly postRepo: Repository<ForumPostEntity>,
  ) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    if (job.name !== 'flush-views') {
      this.logger.warn(`Unknown job "${job.name}"`);
      return { skipped: true };
    }
    return this.flushViews();
  }

  private async flushViews(): Promise<{ flushed: number }> {
    const keys = await this.listCacheKeys();
    let flushed = 0;
    for (const key of keys) {
      const match = key.match(this.cacheEntryPattern);
      if (!match) continue;
      const postId = match[1];
      const value = (await this.cache.get<number>(key)) ?? 0;
      if (value > 0) {
        await this.postRepo.increment({ id: postId }, 'viewCount', value);
        await this.cache.del(key);
        flushed += 1;
      }
    }
    this.logger.log(`Flushed ${flushed} view-count entries`);
    return { flushed };
  }

  private async listCacheKeys(): Promise<string[]> {
    type CacheWithKeys = Cache & {
      store?: { keys?: (pattern?: string) => Promise<string[]> };
      keys?: (pattern?: string) => Promise<string[]>;
    };
    const c = this.cache as CacheWithKeys;
    if (c.store?.keys) return c.store.keys(this.cachePrefix);
    if (c.keys) return c.keys(this.cachePrefix);
    return [];
  }
}
