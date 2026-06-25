import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAuthData1781966917254 implements MigrationInterface {
  name = 'SeedAuthData1781966917254';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "roles" ("code", "name", "description")
      VALUES
        ('OWNER',      'Chủ sở hữu',   'Toàn quyền hệ thống'),
        ('ADMIN',      'Quản trị viên', 'Quản trị hệ thống'),
        ('INSTRUCTOR', 'Giảng viên',    'Quản lý khóa học'),
        ('STUDENT',    'Học viên',      'Học viên tham gia khóa học')
      ON CONFLICT ("code") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "roles" WHERE code IN ('OWNER','ADMIN','INSTRUCTOR','STUDENT')`,
    );
  }
}
