import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserProgressTables1783000000003
  implements MigrationInterface
{
  name = 'CreateUserProgressTables1783000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_bank_progress" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "question_bank_id" uuid NOT NULL,
        "attempt_count" integer NOT NULL DEFAULT 0,
        "best_score" DECIMAL(5,2),
        "latest_score" DECIMAL(5,2),
        "is_completed" boolean NOT NULL DEFAULT false,
        "completed_at" TIMESTAMP,
        "first_attempt_at" TIMESTAMP,
        "last_accessed_at" TIMESTAMP,
        CONSTRAINT "PK_user_bank_progress" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_bank_progress" UNIQUE ("user_id", "question_bank_id"),
        CONSTRAINT "FK_user_bank_progress_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION,
        CONSTRAINT "FK_user_bank_progress_bank" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user_roadmap_progress" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "roadmap_id" uuid NOT NULL,
        "total_banks" integer NOT NULL DEFAULT 0,
        "completed_banks" integer NOT NULL DEFAULT 0,
        "progress_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
        "status" character varying NOT NULL DEFAULT 'not_started',
        "current_bank_id" uuid,
        "last_accessed_bank_id" uuid,
        "started_at" TIMESTAMP,
        "last_accessed_at" TIMESTAMP,
        "completed_at" TIMESTAMP,
        CONSTRAINT "PK_user_roadmap_progress" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_roadmap_progress" UNIQUE ("user_id", "roadmap_id"),
        CONSTRAINT "FK_user_roadmap_progress_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION,
        CONSTRAINT "FK_user_roadmap_progress_roadmap" FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_roadmap_progress_current_bank" FOREIGN KEY ("current_bank_id") REFERENCES "question_banks"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_user_roadmap_progress_last_bank" FOREIGN KEY ("last_accessed_bank_id") REFERENCES "question_banks"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_roadmap_progress"`);
    await queryRunner.query(`DROP TABLE "user_bank_progress"`);
  }
}
