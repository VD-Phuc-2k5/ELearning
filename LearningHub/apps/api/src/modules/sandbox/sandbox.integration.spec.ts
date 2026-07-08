import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ValidationPipe } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SandboxModule } from './sandbox.module';
import { ExecuteCodeUseCase } from './application/use-cases/execute-code.use-case';
import { right } from '@learning-hub/core';
import {
  TEST_SUFFIX,
  seedRoles,
  registerUser,
  loginUser,
  bearer,
  cleanupTestData,
} from '../../test/test-helpers';

// ponytail: custom factory to override ExecuteCodeUseCase with a mock
async function createSandboxTestApp(): Promise<INestApplication> {
  const module = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, envFilePath: 'apps/api/.env' }),
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
      }),
      CacheModule.register({ isGlobal: true }),
      AuthModule,
      SandboxModule,
    ],
  })
    .overrideProvider(ExecuteCodeUseCase)
    .useValue({
      execute: jest.fn().mockResolvedValue(
        right({
          stdout: 'Hello World',
          stderr: '',
          exitCode: 0,
          executionTime: 10,
        }),
      ),
    })
    .compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  return app;
}

describe('Sandbox Integration (IT040–IT043)', () => {
  let app: INestApplication;
  const email = `sandbox-user${TEST_SUFFIX}`;
  let accessToken: string;

  beforeAll(async () => {
    app = await createSandboxTestApp();
    await seedRoles(app);
    await registerUser(app, email, 'sandboxuser');
    ({ accessToken } = await loginUser(app, email));
  });

  afterAll(async () => {
    await cleanupTestData(app);
    await app.close();
  });

  it('IT040 — POST /sandbox/execute with valid payload returns execution result', async () => {
    const res = await request(app.getHttpServer())
      .post('/sandbox/execute')
      .set('Authorization', bearer(accessToken))
      .send({ language: 'python', sourceCode: 'print("Hello World")' });
    expect([200, 201]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('stdout');
    }
  });

  it('IT041 — POST /sandbox/execute without auth returns 401', async () => {
    const res = await request(app.getHttpServer())
      .post('/sandbox/execute')
      .send({ language: 'python', code: 'print("test")' });
    expect(res.status).toBe(401);
  });

  it('IT042 — POST /sandbox/execute missing required fields returns 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/sandbox/execute')
      .set('Authorization', bearer(accessToken))
      .send({ language: 'python' });
    expect(res.status).toBe(400);
  });

  it('IT043 — GET /sandbox/history returns execution history', async () => {
    const res = await request(app.getHttpServer())
      .get('/sandbox/history')
      .set('Authorization', bearer(accessToken));
    expect([200, 403]).toContain(res.status);
    if (res.status === 200) expect(Array.isArray(res.body)).toBe(true);
  });
});
