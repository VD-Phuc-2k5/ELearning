import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, Type } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bullmq';
import { existsSync } from 'fs';
import { AuthModule } from '../modules/auth/auth.module';
import { QuizModule } from '../modules/quiz/quiz.module';
import { RoadmapModule } from '../modules/roadmap/roadmap.module';

function resolveEnvPath(): string | undefined {
  const candidates = ['apps/api/.env', '.env', '../../.env'];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return undefined;
}

export async function createTestApp(
  extraModules: Type[] = [],
): Promise<INestApplication> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, envFilePath: resolveEnvPath() }),
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.POSTGRES_HOST ?? 'localhost',
        port: Number(process.env.POSTGRES_PORT ?? 5432),
        username: process.env.POSTGRES_USER ?? 'postgres',
        password: process.env.POSTGRES_PASSWORD ?? 'postgres',
        database: process.env.POSTGRES_TEST_DB ?? 'test_learning_hub',
        autoLoadEntities: true,
        synchronize: true,
        logging: false,
        dropSchema: false,
        retryAttempts: 10,
        retryDelay: 1000,
      }),
      CacheModule.register({ isGlobal: true }),
      // QuizModule transitively imports ForumModule (queue processors), so
      // Bull is always needed regardless of extraModules — requires a live
      // Redis (see docker-compose.yml postgres+redis services).
      BullModule.forRoot({
        connection: {
          host: process.env.REDIS_HOST ?? 'localhost',
          port: Number(process.env.REDIS_PORT ?? 6379),
          retryStrategy: (times: number) => {
            if (times > 10) return null;
            return Math.min(times * 200, 2000);
          },
        },
      }),
      AuthModule,
      QuizModule,
      RoadmapModule,
      ...extraModules,
    ],
  }).compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  try {
    await app.init();
  } catch (e) {
    await app.close();
    throw e;
  }
  return app;
}
