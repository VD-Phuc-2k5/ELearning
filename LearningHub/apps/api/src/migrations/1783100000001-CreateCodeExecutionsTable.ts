import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCodeExecutionsTable1783100000001
  implements MigrationInterface
{
  name = 'CreateCodeExecutionsTable1783100000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "code_executions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "language" character varying(20) NOT NULL,
        "source_code" text NOT NULL,
        "stdin" text,
        "stdout" text,
        "stderr" text,
        "exit_code" integer,
        "status" character varying(20) NOT NULL,
        "execution_time_ms" integer,
        "memory_used_bytes" bigint,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_code_executions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_code_executions_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_code_executions_user" ON "code_executions" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_code_executions_created" ON "code_executions" ("created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_code_executions_created"`);
    await queryRunner.query(`DROP INDEX "IDX_code_executions_user"`);
    await queryRunner.query(`DROP TABLE "code_executions"`);
  }
}
