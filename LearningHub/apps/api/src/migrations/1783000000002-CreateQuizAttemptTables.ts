import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuizAttemptTables1783000000002
  implements MigrationInterface
{
  name = 'CreateQuizAttemptTables1783000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "quiz_attempts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "question_bank_id" uuid NOT NULL,
        "started_at" TIMESTAMP NOT NULL,
        "finished_at" TIMESTAMP,
        "duration_seconds" integer,
        "score_percent" DECIMAL(5,2),
        "correct_count" integer NOT NULL DEFAULT 0,
        "wrong_count" integer NOT NULL DEFAULT 0,
        "total_questions" integer NOT NULL DEFAULT 0,
        "status" character varying NOT NULL DEFAULT 'in_progress',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_quiz_attempts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_quiz_attempts_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION,
        CONSTRAINT "FK_quiz_attempts_bank" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_quiz_attempts_user_bank" ON "quiz_attempts" ("user_id", "question_bank_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_quiz_attempts_user_created" ON "quiz_attempts" ("user_id", "created_at" DESC)`,
    );

    await queryRunner.query(`
      CREATE TABLE "quiz_attempt_answers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "attempt_id" uuid NOT NULL,
        "question_id" uuid NOT NULL,
        "selected_option_id" uuid,
        "is_correct" boolean NOT NULL DEFAULT false,
        "time_spent_seconds" integer,
        "question_order" integer NOT NULL,
        CONSTRAINT "PK_quiz_attempt_answers" PRIMARY KEY ("id"),
        CONSTRAINT "FK_quiz_attempt_answers_attempt" FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_quiz_attempt_answers_question" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION,
        CONSTRAINT "FK_quiz_attempt_answers_option" FOREIGN KEY ("selected_option_id") REFERENCES "answer_options"("id") ON DELETE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_quiz_attempt_answers_attempt" ON "quiz_attempt_answers" ("attempt_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_quiz_attempt_answers_attempt"`);
    await queryRunner.query(`DROP TABLE "quiz_attempt_answers"`);
    await queryRunner.query(`DROP INDEX "IDX_quiz_attempts_user_created"`);
    await queryRunner.query(`DROP INDEX "IDX_quiz_attempts_user_bank"`);
    await queryRunner.query(`DROP TABLE "quiz_attempts"`);
  }
}
