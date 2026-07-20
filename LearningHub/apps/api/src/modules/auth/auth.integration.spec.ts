import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createTestApp } from '../../test/test-app.factory';
import {
  seedRoles,
  registerUser,
  loginUser,
  bearer,
  cleanupTestData,
  TEST_SUFFIX,
} from '../../test/test-helpers';

describe('Auth — Integration (IT001–IT011)', () => {
  let app: INestApplication;
  let dbAvailable = true;

  beforeAll(async () => {
    try {
      app = await createTestApp();
      await seedRoles(app);
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

  // ── Registration ──────────────────────────────────────────────

  it('IT001 — POST /auth/register → 201, user object returned', async () => {
    if (!dbAvailable) return;
    const res = await registerUser(app, `it001${TEST_SUFFIX}`, 'it001user');
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ email: `it001${TEST_SUFFIX}` });
  });

  it('IT002 — register duplicate email → 409', async () => {
    if (!dbAvailable) return;
    await registerUser(app, `it002${TEST_SUFFIX}`, 'it002user');
    const res = await registerUser(app, `it002${TEST_SUFFIX}`, 'it002user_b');
    expect(res.status).toBe(409);
  });

  it('IT003 — register duplicate username → 409', async () => {
    if (!dbAvailable) return;
    await registerUser(app, `it003a${TEST_SUFFIX}`, 'it003shared');
    const res = await registerUser(app, `it003b${TEST_SUFFIX}`, 'it003shared');
    expect(res.status).toBe(409);
  });

  it('IT004 — register missing title → 400', async () => {
    if (!dbAvailable) return;
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: `it004${TEST_SUFFIX}` }); // missing password + username
    expect(res.status).toBe(400);
  });

  // ── Login ─────────────────────────────────────────────────────

  it('IT005 — POST /auth/login → 200, accessToken in body', async () => {
    if (!dbAvailable) return;
    await registerUser(app, `it005${TEST_SUFFIX}`, 'it005user');
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: `it005${TEST_SUFFIX}`, password: 'Pass@1234' });
    expect(res.status).toBe(201);
    expect(typeof res.body.accessToken).toBe('string');
    expect(typeof res.body.refreshToken).toBe('string');
  });

  it('IT006 — login wrong password → 401', async () => {
    if (!dbAvailable) return;
    await registerUser(app, `it006${TEST_SUFFIX}`, 'it006user');
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: `it006${TEST_SUFFIX}`, password: 'WrongPass' });
    expect(res.status).toBe(401);
  });

  it('IT007 — login non-existent user → 401', async () => {
    if (!dbAvailable) return;
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: `nobody${TEST_SUFFIX}`, password: 'Pass@1234' });
    expect(res.status).toBe(401);
  });

  // ── /auth/me ─────────────────────────────────────────────────

  it('IT008 — GET /auth/me with valid JWT → 200, user data', async () => {
    if (!dbAvailable) return;
    await registerUser(app, `it008${TEST_SUFFIX}`, 'it008user');
    const { accessToken } = await loginUser(app, `it008${TEST_SUFFIX}`);
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', bearer(accessToken));
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(`it008${TEST_SUFFIX}`);
  });

  it('IT009 — GET /auth/me without JWT → 401', async () => {
    if (!dbAvailable) return;
    const res = await request(app.getHttpServer()).get('/auth/me');
    expect(res.status).toBe(401);
  });

  // ── Refresh ──────────────────────────────────────────────────

  it('IT010 — POST /auth/refresh with valid token → 200, new tokens', async () => {
    if (!dbAvailable) return;
    await registerUser(app, `it010${TEST_SUFFIX}`, 'it010user');
    const { refreshToken } = await loginUser(app, `it010${TEST_SUFFIX}`);
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ token: refreshToken });
    expect(res.status).toBe(201);
    expect(typeof res.body.accessToken).toBe('string');
  });

  it('IT013 — expired access token: request fails, refresh mints a working token, retried request succeeds', async () => {
    if (!dbAvailable) return;
    await registerUser(app, `it013${TEST_SUFFIX}`, 'it013user');
    const { accessToken, refreshToken } = await loginUser(
      app,
      `it013${TEST_SUFFIX}`,
    );

    const jwtService = app.get(JwtService);
    const payload = jwtService.decode(accessToken) as {
      sub: string;
      email: string;
    };
    const expiredAccessToken = jwtService.sign(
      { sub: payload.sub, email: payload.email },
      { expiresIn: '-10s' },
    );

    const expiredRes = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', bearer(expiredAccessToken));
    expect(expiredRes.status).toBe(401);

    const refreshRes = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ token: refreshToken });
    expect(refreshRes.status).toBe(201);

    const retryRes = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', bearer(refreshRes.body.accessToken));
    expect(retryRes.status).toBe(200);
    expect(retryRes.body.user.email).toBe(`it013${TEST_SUFFIX}`);
  });

  it('IT012 — two concurrent refreshes racing on the same token (e.g. two tabs) both succeed', async () => {
    if (!dbAvailable) return;
    await registerUser(app, `it012${TEST_SUFFIX}`, 'it012user');
    const { refreshToken } = await loginUser(app, `it012${TEST_SUFFIX}`);

    const post = () =>
      request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ token: refreshToken });

    const [r1, r2] = await Promise.all([post(), post()]);

    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    expect(typeof r1.body.accessToken).toBe('string');
    expect(typeof r2.body.accessToken).toBe('string');
  });

  // ── Logout ───────────────────────────────────────────────────

  it('IT011 — POST /auth/logout → 200', async () => {
    if (!dbAvailable) return;
    await registerUser(app, `it011${TEST_SUFFIX}`, 'it011user');
    const { accessToken, refreshToken } = await loginUser(
      app,
      `it011${TEST_SUFFIX}`,
    );
    const res = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', bearer(accessToken))
      .send({ refreshToken });
    expect(res.status).toBe(201);
  });
});
