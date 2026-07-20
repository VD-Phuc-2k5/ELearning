import { Controller, Get, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Get()
  async check() {
    const checks = { postgres: false, redis: false };

    try {
      await this.dataSource.query('SELECT 1');
      checks.postgres = true;
    } catch (err) {
      this.logger.error('PostgreSQL health check failed', (err as Error).stack);
      checks.postgres = false;
    }

    try {
      await this.cacheManager.set('health', 'ok', 10);
      const val = await this.cacheManager.get('health');
      checks.redis = val === 'ok';
    } catch (err) {
      this.logger.error('Redis health check failed', (err as Error).stack);
      checks.redis = false;
    }

    const allOk = checks.postgres && checks.redis;
    return {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      ...checks,
    };
  }
}
