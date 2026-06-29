import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPassingScoreToBank1783000000004 implements MigrationInterface {
  name = 'AddPassingScoreToBank1783000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "question_banks" ADD COLUMN "passing_score" DECIMAL(5,2) NOT NULL DEFAULT 60.00`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "question_banks" DROP COLUMN "passing_score"`,
    );
  }
}
