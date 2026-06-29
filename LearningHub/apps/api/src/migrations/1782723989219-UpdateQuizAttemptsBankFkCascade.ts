import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateQuizAttemptsBankFkCascade1782723989219
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "quiz_attempts" 
      DROP CONSTRAINT "FK_quiz_attempts_bank"
    `);

    await queryRunner.query(`
      ALTER TABLE "quiz_attempts" 
      ADD CONSTRAINT "FK_quiz_attempts_bank" 
      FOREIGN KEY ("question_bank_id")
      REFERENCES "question_banks"("id") 
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "quiz_attempts" 
      DROP CONSTRAINT "FK_quiz_attempts_bank"
    `);

    await queryRunner.query(`
      ALTER TABLE "quiz_attempts" 
      ADD CONSTRAINT "FK_quiz_attempts_bank" 
      FOREIGN KEY ("question_bank_id")
      REFERENCES "question_banks"("id")
    `);
  }
}
