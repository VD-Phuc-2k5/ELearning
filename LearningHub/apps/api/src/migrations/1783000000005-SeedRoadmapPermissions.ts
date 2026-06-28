import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRoadmapPermissions1783000000005 implements MigrationInterface {
  name = 'SeedRoadmapPermissions1783000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "permissions" ("code", "name", "description", "resource", "action")
      VALUES
        ('roadmap:get',           'Xem roadmap',      'Xem danh sách và chi tiết roadmap', 'roadmap',           'get'),
        ('roadmap:create',        'Tạo roadmap',      'Tạo roadmap mới',                   'roadmap',           'create'),
        ('roadmap:update',        'Cập nhật roadmap', 'Chỉnh sửa roadmap',                 'roadmap',           'update'),
        ('roadmap:delete',        'Xóa roadmap',      'Xóa roadmap',                       'roadmap',           'delete'),
        ('quiz_attempt:get',      'Xem lịch sử thi',  'Xem lịch sử làm quiz',              'quiz_attempt',      'get'),
        ('learning_progress:get', 'Xem tiến độ học',  'Xem tiến độ học tập',               'learning_progress', 'get')
      ON CONFLICT ("code") DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id
      FROM "roles" r CROSS JOIN "permissions" p
      WHERE r.code = 'STUDENT'
        AND p.code IN ('roadmap:get', 'quiz_attempt:get', 'learning_progress:get')
        AND NOT EXISTS (
          SELECT 1 FROM "role_permissions" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
    `);

    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id
      FROM "roles" r CROSS JOIN "permissions" p
      WHERE r.code IN ('OWNER', 'ADMIN')
        AND p.code IN ('roadmap:get', 'roadmap:create', 'roadmap:update', 'roadmap:delete', 'quiz_attempt:get', 'learning_progress:get')
        AND NOT EXISTS (
          SELECT 1 FROM "role_permissions" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
    `);

    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id
      FROM "roles" r CROSS JOIN "permissions" p
      WHERE r.code = 'INSTRUCTOR'
        AND p.code IN ('roadmap:get', 'quiz_attempt:get', 'learning_progress:get')
        AND NOT EXISTS (
          SELECT 1 FROM "role_permissions" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "permissions"
      WHERE code IN ('roadmap:get','roadmap:create','roadmap:update','roadmap:delete','quiz_attempt:get','learning_progress:get')
    `);
  }
}
