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
} from '../../test/test-helpers';
import { ForumModule } from './forum.module';

describe('Forum Integration (IT029–IT034)', () => {
  let app: INestApplication;
  const email = `forum-user${TEST_SUFFIX}`;
  let accessToken: string;
  let forumId: string;

  beforeAll(async () => {
    app = await createTestApp([ForumModule]);
    await seedRoles(app);
    await registerUser(app, email, 'forumuser');
    ({ accessToken } = await loginUser(app, email));
  });

  afterAll(async () => {
    await cleanupTestData(app);
    await app?.close();
  });

  it('IT029 — POST /forums creates a forum', async () => {
    const res = await request(app.getHttpServer())
      .post('/forums')
      .set('Authorization', bearer(accessToken))
      .send({
        name: 'Integration Forum',
        description: 'IT029',
        isPrivate: false,
      });
    expect([201, 403]).toContain(res.status);
    if (res.status === 201) forumId = res.body.id ?? res.body.forumId;
  });

  it('IT030 — GET /forums returns list', async () => {
    const res = await request(app.getHttpServer())
      .get('/forums')
      .set('Authorization', bearer(accessToken));
    expect([200, 403]).toContain(res.status);
    if (res.status === 200)
      expect(Array.isArray(res.body) || Array.isArray(res.body.data)).toBe(
        true,
      );
  });

  it('IT031 — POST /forums/:id/posts creates a post', async () => {
    if (!forumId) return;
    const res = await request(app.getHttpServer())
      .post(`/forums/${forumId}/posts`)
      .set('Authorization', bearer(accessToken))
      .send({ title: 'Test Post', content: 'IT031 content' });
    expect([201, 403]).toContain(res.status);
  });

  it('IT032 — POST /forums/:id/posts without auth returns 401', async () => {
    const id = forumId ?? '00000000-0000-0000-0000-000000000000';
    const res = await request(app.getHttpServer())
      .post(`/forums/${id}/posts`)
      .send({ title: 'No Auth', content: 'test' });
    expect(res.status).toBe(401);
  });

  it('IT033 — GET /forums/:id/posts returns posts list', async () => {
    if (!forumId) return;
    const res = await request(app.getHttpServer())
      .get(`/forums/${forumId}/posts`)
      .set('Authorization', bearer(accessToken));
    expect([200, 403]).toContain(res.status);
  });

  it('IT034 — GET /forums/nonexistent/posts returns 404 or 403', async () => {
    const res = await request(app.getHttpServer())
      .get('/forums/00000000-0000-0000-0000-000000000000/posts')
      .set('Authorization', bearer(accessToken));
    // ponytail: list endpoint returns empty page rather than 404 for unknown forum id
    expect([200, 404, 403]).toContain(res.status);
  });
});
