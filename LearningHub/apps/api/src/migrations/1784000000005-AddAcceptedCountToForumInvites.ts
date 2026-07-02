import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAcceptedCountToForumInvites1784000000005
  implements MigrationInterface
{
  name = 'AddAcceptedCountToForumInvites1784000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "forum_invites"
      ADD COLUMN "accepted_count" integer NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "forum_invites"
      DROP COLUMN "accepted_count"
    `);
  }
}
