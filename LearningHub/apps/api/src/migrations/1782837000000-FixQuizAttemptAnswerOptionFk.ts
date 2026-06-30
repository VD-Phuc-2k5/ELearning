import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixQuizAttemptAnswerOptionFk1782837000000
  implements MigrationInterface
{
  name = 'FixQuizAttemptAnswerOptionFk1782837000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "quiz_attempt_answers"
            DROP CONSTRAINT "FK_quiz_attempt_answers_option"
        `);
    await queryRunner.query(`
            ALTER TABLE "quiz_attempt_answers"
            ADD CONSTRAINT "FK_quiz_attempt_answers_option"
            FOREIGN KEY ("selected_option_id")
            REFERENCES "answer_options"("id")
            ON DELETE SET NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "quiz_attempt_answers"
            DROP CONSTRAINT "FK_quiz_attempt_answers_option"
        `);
    await queryRunner.query(`
            ALTER TABLE "quiz_attempt_answers"
            ADD CONSTRAINT "FK_quiz_attempt_answers_option"
            FOREIGN KEY ("selected_option_id")
            REFERENCES "answer_options"("id")
            ON DELETE NO ACTION
        `);
  }
}
