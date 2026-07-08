import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';

export const TEST_SUFFIX = '@integration-test.com';

export function getDb(app: INestApplication): DataSource {
  return app.get<DataSource>(getDataSourceToken());
}

export async function seedRoles(app: INestApplication): Promise<void> {
  await getDb(app).query(`
    INSERT INTO roles (code, name, description)
    VALUES ('STUDENT', 'Student', 'Default learner'),
           ('OWNER',   'Owner',   'Content creator'),
           ('ADMIN',   'Admin',   'Administrator')
    ON CONFLICT (code) DO NOTHING
  `);
}

export async function registerUser(
  app: INestApplication,
  email: string,
  username: string,
  password = 'Pass@1234',
): Promise<request.Response> {
  return request(app.getHttpServer())
    .post('/auth/register')
    .send({ email, username, password });
}

export async function loginUser(
  app: INestApplication,
  email: string,
  password = 'Pass@1234',
): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password });
  return {
    accessToken: res.body.accessToken,
    refreshToken: res.body.refreshToken,
  };
}

export async function grantOwnerRole(
  app: INestApplication,
  email: string,
): Promise<void> {
  await getDb(app).query(
    `INSERT INTO user_roles (user_id, role_id)
     SELECT u.id, r.id FROM users u, roles r
     WHERE u.email = $1 AND r.code = 'OWNER'
     ON CONFLICT DO NOTHING`,
    [email],
  );
}

export async function seedQuizBankStatuses(
  app: INestApplication,
): Promise<void> {
  await getDb(app).query(`
    INSERT INTO question_bank_status (id, name, description)
    VALUES ('draft', 'Draft', 'Nháp'),
           ('published', 'Published', 'Đã xuất bản'),
           ('archived', 'Archived', 'Lưu trữ'),
           ('pending_review', 'Pending Review', 'Chờ kiểm duyệt'),
           ('approved', 'Approved', 'Đã duyệt')
    ON CONFLICT (id) DO NOTHING
  `);
}

export async function loginAdmin(
  app: INestApplication,
  email: string,
  password = 'Pass@1234',
): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await request(app.getHttpServer())
    .post('/auth/admin/login')
    .send({ email, password });
  return {
    accessToken: res.body.accessToken,
    refreshToken: res.body.refreshToken,
  };
}

export function bearer(token: string): string {
  return `Bearer ${token}`;
}

export async function cleanupTestData(app: INestApplication): Promise<void> {
  const db = getDb(app);
  // roadmaps.creator_id and question_banks.uploader_id have no ON DELETE
  // CASCADE to users — drop dependents first (question_banks cascades to
  // its own uploads/questions/answer_options/quiz_attempts rows)
  await db.query(
    `DELETE FROM roadmaps WHERE creator_id IN (SELECT id FROM users WHERE email LIKE '%${TEST_SUFFIX}')`,
  );
  await db.query(
    `DELETE FROM question_banks WHERE uploader_id IN (SELECT id FROM users WHERE email LIKE '%${TEST_SUFFIX}')`,
  );
  await db.query(`DELETE FROM users WHERE email LIKE '%${TEST_SUFFIX}'`);
}
