import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedAdminUser1781966917256 implements MigrationInterface {
  name = 'SeedAdminUser1781966917256';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const email = process.env.ADMIN_EMAIL ?? 'admin@example.com';
    const rawPassword = process.env.ADMIN_PASSWORD ?? 'Admin123@';
    const hash = await bcrypt.hash(rawPassword, 10);

    await queryRunner.query(
      `INSERT INTO "users" ("id", "email", "password", "username", "isActive")
       VALUES (uuid_generate_v4(), $1, $2, 'admin', true)
       ON CONFLICT ("email") DO NOTHING`,
      [email, hash],
    );

    await queryRunner.query(
      `INSERT INTO "user_roles" ("user_id", "role_id")
       SELECT u.id, r.id
       FROM "users" u, "roles" r
       WHERE u.email = $1 AND r.code = 'OWNER'
       ON CONFLICT DO NOTHING`,
      [email],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const email = process.env.ADMIN_EMAIL ?? 'admin@example.com';
    await queryRunner.query(
      `DELETE FROM "user_roles"
       WHERE user_id = (SELECT id FROM "users" WHERE email = $1)`,
      [email],
    );
    await queryRunner.query(`DELETE FROM "users" WHERE email = $1`, [email]);
  }
}
