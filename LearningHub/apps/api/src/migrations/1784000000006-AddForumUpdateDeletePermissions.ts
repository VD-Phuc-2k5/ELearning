import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForumUpdateDeletePermissions1784000000006
  implements MigrationInterface
{
  name = 'AddForumUpdateDeletePermissions1784000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id
      FROM "roles" r CROSS JOIN "permissions" p
      WHERE r.code IN ('STUDENT', 'INSTRUCTOR')
        AND p.code IN ('forums:update', 'forums:delete')
        AND NOT EXISTS (
          SELECT 1 FROM "role_permissions" rp
          WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "role_permissions"
      WHERE role_id IN (SELECT id FROM "roles" WHERE code IN ('STUDENT', 'INSTRUCTOR'))
        AND permission_id IN (SELECT id FROM "permissions" WHERE code IN ('forums:update', 'forums:delete'))
    `);
  }
}
