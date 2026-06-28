import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoadmapTables1783000000001 implements MigrationInterface {
  name = 'CreateRoadmapTables1783000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "roadmaps" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" text,
        "creator_id" uuid NOT NULL,
        "status" character varying NOT NULL DEFAULT 'draft',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_roadmaps" PRIMARY KEY ("id"),
        CONSTRAINT "FK_roadmaps_creator" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_roadmaps_creator_id" ON "roadmaps" ("creator_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_roadmaps_status" ON "roadmaps" ("status")`,
    );

    await queryRunner.query(`
      CREATE TABLE "roadmap_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "roadmap_id" uuid NOT NULL,
        "question_bank_id" uuid NOT NULL,
        "position" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_roadmap_items" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_roadmap_items_bank" UNIQUE ("roadmap_id", "question_bank_id"),
        CONSTRAINT "FK_roadmap_items_roadmap" FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_roadmap_items_bank" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_roadmap_items_roadmap_id" ON "roadmap_items" ("roadmap_id", "position")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_roadmap_items_roadmap_id"`);
    await queryRunner.query(`DROP TABLE "roadmap_items"`);
    await queryRunner.query(`DROP INDEX "IDX_roadmaps_status"`);
    await queryRunner.query(`DROP INDEX "IDX_roadmaps_creator_id"`);
    await queryRunner.query(`DROP TABLE "roadmaps"`);
  }
}
