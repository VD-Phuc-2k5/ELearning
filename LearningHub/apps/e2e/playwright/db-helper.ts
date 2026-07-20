import { Pool, QueryResultRow } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  user: process.env.POSTGRES_USER ?? 'postgres',
  password: process.env.POSTGRES_PASSWORD ?? 'postgres123',
  database: process.env.POSTGRES_DB ?? 'dev_learning_hub',
});

export async function query<T extends QueryResultRow>(
  sql: string,
  params?: unknown[],
) {
  return pool.query<T>(sql, params);
}

export async function closePool() {
  await pool.end();
}

export const E2E_MARKER = '@e2e-test.com';
export const E2E_SETUP_MARKER = '@e2e-setup.test';

export async function seedRoles() {
  await query(`
    INSERT INTO "roles" ("code", "name", "description")
    VALUES ('STUDENT', 'Student', 'Default learner'),
           ('OWNER',   'Owner',   'Content creator'),
           ('ADMIN',   'Admin',   'Administrator')
    ON CONFLICT ("code") DO NOTHING
  `);
}

export async function seedQuestionBankStatuses() {
  await query(`
    INSERT INTO "question_bank_status" ("id", "name", "description")
    VALUES ('draft', 'Draft', 'Nháp'),
           ('published', 'Published', 'Đã xuất bản'),
           ('archived', 'Archived', 'Lưu trữ'),
           ('pending_review', 'Pending Review', 'Chờ kiểm duyệt'),
           ('approved', 'Approved', 'Đã duyệt')
    ON CONFLICT ("id") DO NOTHING
  `);
}

export async function getTestUserIds() {
  const res = await query<{ id: string }>(
    `SELECT "id" FROM "users" WHERE "email" LIKE $1`,
    [`%${E2E_MARKER}`],
  );
  return res.rows.map((r) => r.id);
}

export async function cleanupE2ETestData() {
  const userIds = await getTestUserIds();
  await cleanupUsersByIds(userIds);
}

export async function cleanupOldSetupUsers() {
  const res = await query<{ id: string }>(
    `SELECT "id" FROM "users" WHERE "email" LIKE $1`,
    [`%${E2E_SETUP_MARKER}`],
  );
  const userIds = res.rows.map((r) => r.id);
  await cleanupUsersByIds(userIds);
}

async function cleanupUsersByIds(userIds: string[]) {
  const idList = userIds.map((id) => `'${id}'`).join(',');
  if (!idList) return;

  await query(`DELETE FROM "roadmaps" WHERE "creator_id" IN (${idList})`);
  await query(
    `DELETE FROM "question_banks" WHERE "uploader_id" IN (${idList})`,
  );
  await query(
    `DELETE FROM "question_bank_uploads" WHERE "uploaded_by" IN (${idList})`,
  );
  await query(
    `DELETE FROM "forum_mentions" WHERE "mentioned_user_id" IN (${idList})`,
  );
  await query(
    `DELETE FROM "forum_notifications" WHERE "recipient_id" IN (${idList}) OR "actor_id" IN (${idList})`,
  );
  await query(
    `DELETE FROM "forum_reports" WHERE "reporter_id" IN (${idList}) OR "resolved_by" IN (${idList})`,
  );
  await query(`DELETE FROM "forum_bookmarks" WHERE "user_id" IN (${idList})`);
  await query(`DELETE FROM "forum_poll_votes" WHERE "user_id" IN (${idList})`);
  await query(`DELETE FROM "forum_invites" WHERE "inviter_id" IN (${idList})`);
  await query(`DELETE FROM "forum_members" WHERE "user_id" IN (${idList})`);
  await query(`DELETE FROM "forum_follows" WHERE "user_id" IN (${idList})`);
  await query(`DELETE FROM "forum_comments" WHERE "author_id" IN (${idList})`);
  await query(`DELETE FROM "forum_posts" WHERE "author_id" IN (${idList})`);
  await query(`DELETE FROM "forums" WHERE "owner_id" IN (${idList})`);
  await query(`DELETE FROM "quiz_attempts" WHERE "user_id" IN (${idList})`);
  await query(
    `DELETE FROM "user_bank_progress" WHERE "user_id" IN (${idList})`,
  );
  await query(
    `DELETE FROM "user_roadmap_progress" WHERE "user_id" IN (${idList})`,
  );
  await query(`DELETE FROM "user_roles" WHERE "user_id" IN (${idList})`);
  await query(`DELETE FROM "user_permissions" WHERE "user_id" IN (${idList})`);
  await query(`DELETE FROM "refresh_tokens" WHERE "user_id" IN (${idList})`);
  await query(`DELETE FROM "users" WHERE "id" IN (${idList})`);
}

export async function checkUserExists(email: string) {
  const res = await query<{ id: string }>(
    `SELECT "id" FROM "users" WHERE "email" = $1`,
    [email],
  );
  return res.rows.length > 0 ? res.rows[0] : null;
}

export async function checkUserHasRole(email: string, roleCode: string) {
  const res = await query<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM "users" u
     JOIN "user_roles" ur ON u."id" = ur."user_id"
     JOIN "roles" r ON ur."role_id" = r."id"
     WHERE u."email" = $1 AND r."code" = $2`,
    [email, roleCode],
  );
  return Number(res.rows[0].count) >= 1;
}

export async function checkRoadmapExists(title: string) {
  const res = await query<{ id: string }>(
    `SELECT "id" FROM "roadmaps" WHERE "title" = $1`,
    [title],
  );
  return res.rows.length > 0 ? res.rows[0] : null;
}

export async function checkForumExists(name: string) {
  const res = await query<{ id: string }>(
    `SELECT "id" FROM "forums" WHERE "name" = $1`,
    [name],
  );
  return res.rows.length > 0 ? res.rows[0] : null;
}

export async function checkPostExists(title: string) {
  const res = await query<{ id: string }>(
    `SELECT "id" FROM "forum_posts" WHERE "title" = $1`,
    [title],
  );
  return res.rows.length > 0 ? res.rows[0] : null;
}

export async function checkQuizBankExists(title: string) {
  const res = await query<{ id: string }>(
    `SELECT "id" FROM "question_banks" WHERE "title" = $1`,
    [title],
  );
  return res.rows.length > 0 ? res.rows[0] : null;
}

export async function getUserIdByEmail(email: string) {
  const res = await query<{ id: string }>(
    `SELECT "id" FROM "users" WHERE "email" = $1`,
    [email],
  );
  return res.rows.length ? res.rows[0].id : null;
}

export async function grantRoleToUser(email: string, roleCode: string) {
  await query(
    `INSERT INTO "user_roles" ("user_id", "role_id")
     SELECT u."id", r."id" FROM "users" u, "roles" r
     WHERE u."email" = $1 AND r."code" = $2
     AND NOT EXISTS (
       SELECT 1 FROM "user_roles" ur
       WHERE ur."user_id" = u."id" AND ur."role_id" = r."id"
     )`,
    [email, roleCode],
  );
}

export async function seedAdminUser(
  email: string,
  username: string,
  password: string,
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const res = await query<{ id: string }>(
    `INSERT INTO "users" ("id", "email", "username", "password")
     VALUES (uuid_generate_v4(), $1, $2, $3)
     ON CONFLICT ("email") DO NOTHING
     RETURNING "id"`,
    [email, username, hashedPassword],
  );
  if (res.rows.length > 0) {
    await grantRoleToUser(email, 'OWNER');
  }
  return res.rows[0]?.id;
}
