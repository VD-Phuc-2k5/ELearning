import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAdminToOwner1781966917257 implements MigrationInterface {
  name = 'FixAdminToOwner1781966917257';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const email = process.env.ADMIN_EMAIL ?? 'admin@example.com';

    await queryRunner.query(`
      INSERT INTO "roles" ("code", "name", "description")
      VALUES ('OWNER', 'Chủ sở hữu', 'Toàn quyền hệ thống, vượt qua mọi kiểm tra phân quyền')
      ON CONFLICT ("code") DO NOTHING
    `);

    await queryRunner.query(
      `UPDATE "user_roles"
       SET "role_id" = (SELECT id FROM "roles" WHERE code = 'OWNER')
       WHERE "user_id" = (SELECT id FROM "users" WHERE email = $1)
         AND "role_id" = (SELECT id FROM "roles" WHERE code = 'ADMIN')`,
      [email],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const email = process.env.ADMIN_EMAIL ?? 'admin@example.com';

    await queryRunner.query(
      `UPDATE "user_roles"
       SET "role_id" = (SELECT id FROM "roles" WHERE code = 'ADMIN')
       WHERE "user_id" = (SELECT id FROM "users" WHERE email = $1)
         AND "role_id" = (SELECT id FROM "roles" WHERE code = 'OWNER')`,
      [email],
    );

    await queryRunner.query(`DELETE FROM "roles" WHERE code = 'OWNER'`);
  }
}
