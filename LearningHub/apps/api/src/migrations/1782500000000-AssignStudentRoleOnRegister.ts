import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssignStudentRoleOnRegister1782500000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION assign_default_student_role()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO "user_roles" ("user_id", "role_id")
        SELECT NEW.id, r.id FROM "roles" r WHERE r.name = 'STUDENT'
        ON CONFLICT DO NOTHING;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER assign_student_role_after_insert
      AFTER INSERT ON "users"
      FOR EACH ROW EXECUTE FUNCTION assign_default_student_role();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS assign_student_role_after_insert ON "users"`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS assign_default_student_role`,
    );
  }
}
