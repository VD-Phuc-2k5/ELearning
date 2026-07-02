import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForumPostTags1784000000004 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "forum_post_tags" (
        "post_id" uuid NOT NULL,
        "tag_id" integer NOT NULL,
        CONSTRAINT "PK_forum_post_tags" PRIMARY KEY ("post_id", "tag_id"),
        CONSTRAINT "FK_forum_post_tags_post"
          FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_forum_post_tags_tag"
          FOREIGN KEY ("tag_id") REFERENCES "forum_tags"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_forum_post_tags_post_id" ON "forum_post_tags" ("post_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_forum_post_tags_tag_id" ON "forum_post_tags" ("tag_id")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "forum_post_tags"`);
  }
}
