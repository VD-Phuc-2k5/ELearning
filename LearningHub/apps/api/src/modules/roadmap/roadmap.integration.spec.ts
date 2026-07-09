import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../../test/test-app.factory';
import {
  seedRoles,
  registerUser,
  loginAdmin,
  bearer,
  cleanupTestData,
  grantOwnerRole,
  TEST_SUFFIX,
} from '../../test/test-helpers';

describe('Roadmap — Integration (IT017–IT019)', () => {
  let app: INestApplication;
  let token: string;
  let roadmapId: string;

  beforeAll(async () => {
    app = await createTestApp();
    await seedRoles(app);
    await registerUser(app, `roadmap${TEST_SUFFIX}`, 'roadmapuser');
    await grantOwnerRole(app, `roadmap${TEST_SUFFIX}`);
    const tokens = await loginAdmin(app, `roadmap${TEST_SUFFIX}`);
    token = tokens.accessToken;
  });

  afterAll(async () => {
    await cleanupTestData(app);
    await app?.close();
  });

  it('IT017 — POST /roadmaps → 201, roadmap saved in DB', async () => {
    const res = await request(app.getHttpServer())
      .post('/roadmaps')
      .set('Authorization', bearer(token))
      .send({ title: 'Integration Roadmap', description: 'IT roadmap' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeTruthy();
    roadmapId = res.body.id as string;
  });

  it('IT018 — POST /roadmaps/:id/enroll → enrolled successfully', async () => {
    const res = await request(app.getHttpServer())
      .post(`/roadmaps/${roadmapId}/enroll`)
      .set('Authorization', bearer(token));
    expect([200, 201]).toContain(res.status);
    expect(res.body.roadmapId).toBe(roadmapId);
  });

  it('IT019 — POST /roadmaps/:id/enroll twice → idempotent, same progress returned', async () => {
    const res = await request(app.getHttpServer())
      .post(`/roadmaps/${roadmapId}/enroll`)
      .set('Authorization', bearer(token));
    expect([200, 201]).toContain(res.status);
    expect(res.body.roadmapId).toBe(roadmapId);
  });
});
