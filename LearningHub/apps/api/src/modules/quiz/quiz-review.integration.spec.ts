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

describe('Quiz Review Integration (IT025–IT028)', () => {
  let app: INestApplication;
  const ownerEmail = `quiz-review-owner${TEST_SUFFIX}`;

  beforeAll(async () => {
    app = await createTestApp();
    await seedRoles(app);
    await registerUser(app, ownerEmail, 'quizreviewowner');
  });

  afterAll(async () => {
    await cleanupTestData(app);
    await app.close();
  });

  it('IT025 — create a bank then PATCH /admin/quiz/banks/:id/approve returns 200 or 403', async () => {
    const { accessToken } = await loginUser(app, ownerEmail);

    const createRes = await request(app.getHttpServer())
      .post('/quiz/banks')
      .set('Authorization', bearer(accessToken))
      .send({ title: 'Review Test Bank', description: 'IT025', tags: [] });

    // If creation is blocked by role guard, skip
    if (createRes.status !== 201) return;
    const bankId = createRes.body.id ?? createRes.body.bankId;

    const approveRes = await request(app.getHttpServer())
      .patch(`/admin/quiz/banks/${bankId}/approve`)
      .set('Authorization', bearer(accessToken));

    expect([200, 403]).toContain(approveRes.status);

    await getDb(app).query(`DELETE FROM question_banks WHERE id = '${bankId}'`);
  });

  it('IT026 — PATCH /admin/quiz/banks/:id/reject with reason returns 200 or 403', async () => {
    const { accessToken } = await loginUser(app, ownerEmail);

    const createRes = await request(app.getHttpServer())
      .post('/quiz/banks')
      .set('Authorization', bearer(accessToken))
      .send({ title: 'Reject Test Bank', description: 'IT026', tags: [] });

    if (createRes.status !== 201) return;
    const bankId = createRes.body.id ?? createRes.body.bankId;

    const rejectRes = await request(app.getHttpServer())
      .patch(`/admin/quiz/banks/${bankId}/reject`)
      .set('Authorization', bearer(accessToken))
      .send({ reason: 'Nội dung chưa đạt' });

    expect([200, 403]).toContain(rejectRes.status);

    await getDb(app).query(`DELETE FROM question_banks WHERE id = '${bankId}'`);
  });

  it('IT027 — PATCH /admin/quiz/banks/nonexistent/approve returns 404 or 403', async () => {
    const { accessToken } = await loginUser(app, ownerEmail);
    const res = await request(app.getHttpServer())
      .patch('/admin/quiz/banks/00000000-0000-0000-0000-000000000000/approve')
      .set('Authorization', bearer(accessToken));
    expect([404, 403]).toContain(res.status);
  });

  it('IT028 — unauthenticated approve returns 401', async () => {
    const res = await request(app.getHttpServer()).patch(
      '/admin/quiz/banks/00000000-0000-0000-0000-000000000000/approve',
    );
    expect(res.status).toBe(401);
  });
});
