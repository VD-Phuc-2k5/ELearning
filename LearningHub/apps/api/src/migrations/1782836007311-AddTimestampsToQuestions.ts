import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampsToQuestions1782836007311
  implements MigrationInterface
{
  name = 'AddTimestampsToQuestions1782836007311';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "questions" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "created_at"`);
  }
}
