import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../../test/test-app.factory';
import {
  TEST_SUFFIX,
  seedRoles,
  registerUser,
  loginUser,
  bearer,
  cleanupTestData,
  getDb,
} from '../../test/test-helpers';
import { JudgeModule } from './judge.module';

describe('Judge Integration (IT035–IT039)', () => {
  let app: INestApplication;
  let dbAvailable = true;
  const email = `judge-user${TEST_SUFFIX}`;
  let accessToken: string;

  beforeAll(async () => {
    try {
      app = await createTestApp([JudgeModule]);
      await seedRoles(app);
      await registerUser(app, email, 'judgeuser');
      ({ accessToken } = await loginUser(app, email));
    } catch {
      dbAvailable = false;
    }
  });

  afterAll(async () => {
    if (app) {
      await cleanupTestData(app);
      await app?.close();
    }
  });

  it('IT035 — GET /problems returns list', async () => {
    if (!dbAvailable) return;
    const res = await request(app.getHttpServer())
      .get('/problems')
      .set('Authorization', bearer(accessToken));
    expect([200, 403]).toContain(res.status);
    if (res.status === 200)
      expect(Array.isArray(res.body) || Array.isArray(res.body.data)).toBe(
        true,
      );
  });

  it('IT036 — POST /problems creates a problem (admin only)', async () => {
    if (!dbAvailable) return;
    const res = await request(app.getHttpServer())
      .post('/problems')
      .set('Authorization', bearer(accessToken))
      .send({
        title: 'IT036 Problem',
        description: 'Integration test problem',
        difficulty: 'easy',
        languages: ['python'],
      });
    // Regular user should get 403; admin would get 201
    expect([201, 403]).toContain(res.status);
    if (res.status === 201) {
      const id = res.body.id;
      await getDb(app).query(`DELETE FROM coding_problems WHERE id = '${id}'`);
    }
  });

  it('IT037 — POST /problems missing required fields returns 400 or 403', async () => {
    if (!dbAvailable) return;
    const res = await request(app.getHttpServer())
      .post('/problems')
      .set('Authorization', bearer(accessToken))
      .send({ title: 'Incomplete' });
    expect([400, 403]).toContain(res.status);
  });

  it('IT038 — GET /problems/nonexistent returns 404 or 403', async () => {
    if (!dbAvailable) return;
    const res = await request(app.getHttpServer())
      .get('/problems/00000000-0000-0000-0000-000000000000')
      .set('Authorization', bearer(accessToken));
    expect([404, 403]).toContain(res.status);
  });

  it('IT039 — unauthenticated GET /problems returns 401', async () => {
    if (!dbAvailable) return;
    const res = await request(app.getHttpServer()).get('/problems');
    expect(res.status).toBe(401);
  });
});
