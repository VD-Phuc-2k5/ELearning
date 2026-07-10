import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixForumPostCascadeDeletes1785000000005
  implements MigrationInterface
{
  name = 'FixForumPostCascadeDeletes1785000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "forum_comments" DROP CONSTRAINT "FK_274dc9abde99249ab89a47789b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_comments" ADD CONSTRAINT "FK_274dc9abde99249ab89a47789b2" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "forum_bookmarks" DROP CONSTRAINT "FK_87bda613a149a12bfa73812e7f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_bookmarks" ADD CONSTRAINT "FK_87bda613a149a12bfa73812e7f4" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "forum_mentions" DROP CONSTRAINT "FK_6d5fdacaeda15b48b4667820343"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_mentions" ADD CONSTRAINT "FK_6d5fdacaeda15b48b4667820343" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "forum_polls" DROP CONSTRAINT "FK_c5beba2fc86343db6a44031e3a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_polls" ADD CONSTRAINT "FK_c5beba2fc86343db6a44031e3a1" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "forum_comments" DROP CONSTRAINT "FK_274dc9abde99249ab89a47789b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_comments" ADD CONSTRAINT "FK_274dc9abde99249ab89a47789b2" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "forum_bookmarks" DROP CONSTRAINT "FK_87bda613a149a12bfa73812e7f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_bookmarks" ADD CONSTRAINT "FK_87bda613a149a12bfa73812e7f4" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "forum_mentions" DROP CONSTRAINT "FK_6d5fdacaeda15b48b4667820343"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_mentions" ADD CONSTRAINT "FK_6d5fdacaeda15b48b4667820343" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "forum_polls" DROP CONSTRAINT "FK_c5beba2fc86343db6a44031e3a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_polls" ADD CONSTRAINT "FK_c5beba2fc86343db6a44031e3a1" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
