import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToCodingProblems1783200000003
  implements MigrationInterface
{
  name = 'AddStatusToCodingProblems1783200000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "coding_problems"
      ADD COLUMN "status" character varying(20) NOT NULL DEFAULT 'draft'
    `);

    await queryRunner.query(`
      UPDATE "coding_problems" cp
      SET "status" = 'public'
      WHERE EXISTS (
        SELECT 1 FROM "test_cases" tc
        WHERE tc."problem_id" = cp."id"
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "coding_problems"
      DROP COLUMN "status"
    `);
  }
}
