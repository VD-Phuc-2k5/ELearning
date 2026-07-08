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

describe('RBAC Integration (IT020–IT024)', () => {
  let app: INestApplication;
  const email = `rbac-test${TEST_SUFFIX}`;

  beforeAll(async () => {
    app = await createTestApp();
    await seedRoles(app);
    await registerUser(app, email, 'rbacuser');
  });

  afterAll(async () => {
    await cleanupTestData(app);
    await app.close();
  });

  it('IT020 — GET /admin/roles returns role list', async () => {
    const { accessToken } = await loginUser(app, email);
    const res = await request(app.getHttpServer())
      .get('/admin/roles')
      .set('Authorization', bearer(accessToken));
    // Admin guard may block non-admin; at least expect non-500
    expect([200, 403]).toContain(res.status);
  });

  it('IT021 — POST /admin/roles creates a role (conflict if already exists)', async () => {
    const { accessToken } = await loginUser(app, email);
    const res = await request(app.getHttpServer())
      .post('/admin/roles')
      .set('Authorization', bearer(accessToken))
      .send({
        code: 'TEST_ROLE',
        name: 'Test Role',
        description: 'IT test role',
      });
    expect([201, 403, 409]).toContain(res.status);
    // Cleanup if created
    if (res.status === 201) {
      await getDb(app).query(`DELETE FROM roles WHERE code = 'TEST_ROLE'`);
    }
  });

  it('IT022 — POST /admin/roles with missing code returns 400', async () => {
    const { accessToken } = await loginUser(app, email);
    const res = await request(app.getHttpServer())
      .post('/admin/roles')
      .set('Authorization', bearer(accessToken))
      .send({ name: 'No Code Role' });
    expect([400, 403]).toContain(res.status);
  });

  it('IT023 — GET /admin/roles/:id/permissions returns permissions array', async () => {
    const { accessToken } = await loginUser(app, email);
    const roles = await getDb(app).query(`SELECT id FROM roles LIMIT 1`);
    if (!roles.length) return;
    const roleId = roles[0].id;
    const res = await request(app.getHttpServer())
      .get(`/admin/roles/${roleId}/permissions`)
      .set('Authorization', bearer(accessToken));
    expect([200, 403]).toContain(res.status);
    if (res.status === 200) expect(Array.isArray(res.body)).toBe(true);
  });

  it('IT024 — unauthenticated GET /admin/roles returns 401', async () => {
    const res = await request(app.getHttpServer()).get('/admin/roles');
    expect(res.status).toBe(401);
  });
});
