import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRoadmapPermissions1783000000005 implements MigrationInterface {
  name = 'SeedRoadmapPermissions1783000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "permissions" ("code", "name", "description", "resource", "action")
      VALUES
        ('roadmaps:get',    'Xem roadmap',      'Xem danh sách và chi tiết roadmap', 'roadmaps', 'get'),
        ('roadmaps:create', 'Tạo roadmap',      'Tạo roadmap mới',                   'roadmaps', 'create'),
        ('roadmaps:update', 'Cập nhật roadmap', 'Chỉnh sửa roadmap',                 'roadmaps', 'update'),
        ('roadmaps:delete', 'Xóa roadmap',      'Xóa roadmap',                       'roadmaps', 'delete')
      ON CONFLICT ("code") DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id
      FROM "roles" r CROSS JOIN "permissions" p
      WHERE r.code = 'STUDENT'
        AND p.code IN ('roadmaps:get')
        AND NOT EXISTS (
          SELECT 1 FROM "role_permissions" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
    `);

    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id
      FROM "roles" r CROSS JOIN "permissions" p
      WHERE r.code IN ('OWNER', 'ADMIN')
        AND p.code IN ('roadmaps:get', 'roadmaps:create', 'roadmaps:update', 'roadmaps:delete')
        AND NOT EXISTS (
          SELECT 1 FROM "role_permissions" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
    `);

    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id
      FROM "roles" r CROSS JOIN "permissions" p
      WHERE r.code = 'INSTRUCTOR'
        AND p.code IN ('roadmaps:get')
        AND NOT EXISTS (
          SELECT 1 FROM "role_permissions" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "permissions"
      WHERE code IN ('roadmaps:get','roadmaps:create','roadmaps:update','roadmaps:delete')
    `);
  }
}
