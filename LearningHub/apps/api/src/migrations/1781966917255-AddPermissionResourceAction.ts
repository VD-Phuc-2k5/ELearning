import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPermissionResourceAction1781966917255
  implements MigrationInterface
{
  name = 'AddPermissionResourceAction1781966917255';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD "resource" VARCHAR NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD "action" VARCHAR NOT NULL DEFAULT ''`,
    );

    // Backfill existing rows: derive resource+action from code (format: resource:action)
    await queryRunner.query(`
      UPDATE "permissions"
      SET
        "resource" = SPLIT_PART("code", ':', 1),
        "action"   = SPLIT_PART("code", ':', 2)
      WHERE "code" LIKE '%:%'
    `);

    await queryRunner.query(
      `ALTER TABLE "permissions" ALTER COLUMN "resource" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ALTER COLUMN "action" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "permissions" DROP COLUMN "action"`);
    await queryRunner.query(`ALTER TABLE "permissions" DROP COLUMN "resource"`);
  }
}
