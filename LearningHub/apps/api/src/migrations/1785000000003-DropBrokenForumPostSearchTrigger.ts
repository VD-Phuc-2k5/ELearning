import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropBrokenForumPostSearchTrigger1785000000003
  implements MigrationInterface
{
  name = 'DropBrokenForumPostSearchTrigger1785000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS forum_posts_search_vector_trigger ON "forum_posts"`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS forum_posts_search_vector_update`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE FUNCTION forum_posts_search_vector_update() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector := setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A');
        RETURN NEW;
      END
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(`
      CREATE TRIGGER forum_posts_search_vector_trigger
      BEFORE INSERT OR UPDATE ON "forum_posts"
      FOR EACH ROW EXECUTE FUNCTION forum_posts_search_vector_update()
    `);
  }
}
