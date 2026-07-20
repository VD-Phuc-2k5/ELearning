import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueUsername1785000000001 implements MigrationInterface {
  name = 'AddUniqueUsername1785000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_users_username" UNIQUE ("username")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_users_username"`,
    );
  }
}
