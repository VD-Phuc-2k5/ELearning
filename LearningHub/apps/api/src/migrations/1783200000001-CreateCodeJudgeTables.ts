import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCodeJudgeTables1783200000001 implements MigrationInterface {
  name = 'CreateCodeJudgeTables1783200000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "coding_problems" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "description" text NOT NULL,
        "difficulty" character varying(20) NOT NULL,
        "time_limit_ms" integer NOT NULL DEFAULT 5000,
        "memory_limit_mb" integer NOT NULL DEFAULT 256,
        "sample_input" text,
        "sample_output" text,
        "languages" jsonb NOT NULL,
        "creator_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_coding_problems" PRIMARY KEY ("id"),
        CONSTRAINT "FK_coding_problems_creator" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "test_cases" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "problem_id" uuid NOT NULL,
        "input" text NOT NULL,
        "expected_output" text NOT NULL,
        "is_hidden" boolean NOT NULL DEFAULT true,
        "order_index" integer NOT NULL DEFAULT 0,
        "points" integer NOT NULL DEFAULT 1,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_test_cases" PRIMARY KEY ("id"),
        CONSTRAINT "FK_test_cases_problem" FOREIGN KEY ("problem_id") REFERENCES "coding_problems"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "code_submissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "problem_id" uuid NOT NULL,
        "language" character varying(50) NOT NULL,
        "source_code" text NOT NULL,
        "status" character varying(30) NOT NULL DEFAULT 'queued',
        "score" integer NOT NULL DEFAULT 0,
        "total_test_cases" integer NOT NULL DEFAULT 0,
        "passed_test_cases" integer NOT NULL DEFAULT 0,
        "execution_time_ms" integer,
        "memory_used_kb" integer,
        "error_message" text,
        "submitted_at" TIMESTAMP NOT NULL DEFAULT now(),
        "judged_at" TIMESTAMP,
        CONSTRAINT "PK_code_submissions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_code_submissions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_code_submissions_problem" FOREIGN KEY ("problem_id") REFERENCES "coding_problems"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "submission_results" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "submission_id" uuid NOT NULL,
        "test_case_id" uuid NOT NULL,
        "status" character varying(30) NOT NULL,
        "actual_output" text,
        "execution_time_ms" integer,
        "memory_used_kb" integer,
        "error_message" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_submission_results" PRIMARY KEY ("id"),
        CONSTRAINT "FK_submission_results_submission" FOREIGN KEY ("submission_id") REFERENCES "code_submissions"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_submission_results_test_case" FOREIGN KEY ("test_case_id") REFERENCES "test_cases"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_coding_problems_creator" ON "coding_problems" ("creator_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_test_cases_problem" ON "test_cases" ("problem_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_code_submissions_user" ON "code_submissions" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_code_submissions_problem" ON "code_submissions" ("problem_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_submission_results_submission" ON "submission_results" ("submission_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_submission_results_submission"`);
    await queryRunner.query(`DROP INDEX "IDX_code_submissions_problem"`);
    await queryRunner.query(`DROP INDEX "IDX_code_submissions_user"`);
    await queryRunner.query(`DROP INDEX "IDX_test_cases_problem"`);
    await queryRunner.query(`DROP INDEX "IDX_coding_problems_creator"`);

    await queryRunner.query(`DROP TABLE "submission_results"`);
    await queryRunner.query(`DROP TABLE "code_submissions"`);
    await queryRunner.query(`DROP TABLE "test_cases"`);
    await queryRunner.query(`DROP TABLE "coding_problems"`);
  }
}
