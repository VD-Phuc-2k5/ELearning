import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTemplatesAndWrappersToCodingProblems1783200000002
  implements MigrationInterface
{
  name = 'AddTemplatesAndWrappersToCodingProblems1783200000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "coding_problems"
      ADD COLUMN "templates" jsonb NOT NULL DEFAULT '{}',
      ADD COLUMN "wrappers" jsonb NOT NULL DEFAULT '{}'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "coding_problems"
      DROP COLUMN "wrappers",
      DROP COLUMN "templates"
    `);
  }
}
