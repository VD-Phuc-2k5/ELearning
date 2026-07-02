import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminModerationPermissions1784000000007
  implements MigrationInterface
{
  name = 'AddAdminModerationPermissions1784000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "permissions" ("code", "name", "description", "resource", "action")
      VALUES
        ('posts:update',      'Ẩn/khôi phục bài viết',     'Ẩn hoặc khôi phục bài viết vi phạm',  'posts',       'update'),
        ('reports:get',       'Xem danh sách báo cáo',     'Xem danh sách báo cáo vi phạm',        'reports',     'get'),
        ('reports:update',    'Xử lý báo cáo',             'Giải quyết hoặc bỏ qua báo cáo',       'reports',     'update')
      ON CONFLICT ("code") DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id
      FROM "roles" r CROSS JOIN "permissions" p
      WHERE r.code IN ('ADMIN', 'OWNER')
        AND p.code IN ('posts:update', 'reports:get', 'reports:update')
        AND NOT EXISTS (
          SELECT 1 FROM "role_permissions" rp
          WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "role_permissions"
      WHERE permission_id IN (
        SELECT id FROM "permissions"
        WHERE code IN ('posts:update', 'reports:get', 'reports:update')
      )
    `);
    await queryRunner.query(`
      DELETE FROM "permissions"
      WHERE code IN ('posts:update', 'reports:get', 'reports:update')
    `);
  }
}
