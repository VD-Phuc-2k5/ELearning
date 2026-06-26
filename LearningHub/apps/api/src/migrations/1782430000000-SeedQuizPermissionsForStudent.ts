import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedQuizPermissionsForStudent1782430000000 implements MigrationInterface {
  name = 'SeedQuizPermissionsForStudent1782430000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "permissions" ("code", "name", "description", "resource", "action")
      VALUES
        ('quiz:get',    'Xem quiz',       'Xem ngân hàng câu hỏi',      'quiz', 'get'),
        ('quiz:create', 'Tạo quiz',       'Tạo ngân hàng câu hỏi',      'quiz', 'create'),
        ('quiz:update', 'Cập nhật quiz',  'Chỉnh sửa ngân hàng câu hỏi','quiz', 'update'),
        ('quiz:delete', 'Xóa quiz',       'Xóa ngân hàng câu hỏi',      'quiz', 'delete')
      ON CONFLICT ("code") DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id
      FROM "roles" r
      CROSS JOIN "permissions" p
      WHERE r.code = 'STUDENT'
        AND p.code IN ('quiz:get', 'quiz:create', 'quiz:update', 'quiz:delete')
        AND NOT EXISTS (
          SELECT 1 FROM "role_permissions" rp
          WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "permissions" WHERE code IN ('quiz:get','quiz:create','quiz:update','quiz:delete')
    `);
  }
}
