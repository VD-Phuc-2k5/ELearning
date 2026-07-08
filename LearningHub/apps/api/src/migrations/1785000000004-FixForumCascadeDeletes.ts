import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixForumCascadeDeletes1785000000004 implements MigrationInterface {
  name = 'FixForumCascadeDeletes1785000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "forum_posts" DROP CONSTRAINT "FK_67071706515dfcc2076ad58ec85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" ADD CONSTRAINT "FK_67071706515dfcc2076ad58ec85" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "forum_follows" DROP CONSTRAINT "FK_5f59040ba3df5800ff2f71fae16"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_follows" ADD CONSTRAINT "FK_5f59040ba3df5800ff2f71fae16" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "forum_invites" DROP CONSTRAINT "FK_5cd2fc7d54feddf43a49033212e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_invites" ADD CONSTRAINT "FK_5cd2fc7d54feddf43a49033212e" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "forum_members" DROP CONSTRAINT "FK_e948682ad2932e255251cabe014"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_members" ADD CONSTRAINT "FK_e948682ad2932e255251cabe014" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "forum_rules" DROP CONSTRAINT "FK_e19a0977fdf3f701c5755003fb1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_rules" ADD CONSTRAINT "FK_e19a0977fdf3f701c5755003fb1" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "forum_posts" DROP CONSTRAINT "FK_67071706515dfcc2076ad58ec85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_posts" ADD CONSTRAINT "FK_67071706515dfcc2076ad58ec85" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "forum_follows" DROP CONSTRAINT "FK_5f59040ba3df5800ff2f71fae16"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_follows" ADD CONSTRAINT "FK_5f59040ba3df5800ff2f71fae16" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "forum_invites" DROP CONSTRAINT "FK_5cd2fc7d54feddf43a49033212e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_invites" ADD CONSTRAINT "FK_5cd2fc7d54feddf43a49033212e" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "forum_members" DROP CONSTRAINT "FK_e948682ad2932e255251cabe014"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_members" ADD CONSTRAINT "FK_e948682ad2932e255251cabe014" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "forum_rules" DROP CONSTRAINT "FK_e19a0977fdf3f701c5755003fb1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_rules" ADD CONSTRAINT "FK_e19a0977fdf3f701c5755003fb1" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
