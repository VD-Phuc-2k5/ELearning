import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixUserCascadeDeletes1785000000006 implements MigrationInterface {
  name = 'FixUserCascadeDeletes1785000000006';

  private readonly cascadeFks: Array<{
    table: string;
    constraint: string;
    column: string;
  }> = [
    {
      table: 'quiz_attempts',
      constraint: 'FK_1701aaf48f6a78e96bfe08dd395',
      column: 'user_id',
    },
    {
      table: 'user_bank_progress',
      constraint: 'FK_23dd604e6fad1632aa94e326c0d',
      column: 'user_id',
    },
    {
      table: 'user_roadmap_progress',
      constraint: 'FK_52907d6297d1057593f203aed9b',
      column: 'user_id',
    },
    {
      table: 'forum_comments',
      constraint: 'FK_8e7d4ffc2c0ccb3087e2d590c57',
      column: 'author_id',
    },
    {
      table: 'forum_posts',
      constraint: 'FK_141ee222adc1090094e49486a00',
      column: 'author_id',
    },
  ];

  private readonly setNullFks: Array<{
    table: string;
    constraint: string;
    column: string;
  }> = [
    {
      table: 'roadmaps',
      constraint: 'FK_d3f6fcd5c48ebd4940bfcbb8afb',
      column: 'creator_id',
    },
    {
      table: 'forum_invites',
      constraint: 'FK_7da8d583e9fd1ed022591f47b5b',
      column: 'inviter_id',
    },
    {
      table: 'question_banks',
      constraint: 'FK_03d3707d8139feab1d62a6f6d7d',
      column: 'uploader_id',
    },
    {
      table: 'question_bank_uploads',
      constraint: 'FK_500134d04b03e176aa602d65375',
      column: 'uploaded_by',
    },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const fk of this.cascadeFks) {
      await queryRunner.query(
        `ALTER TABLE "${fk.table}" DROP CONSTRAINT "${fk.constraint}"`,
      );
      await queryRunner.query(
        `ALTER TABLE "${fk.table}" ADD CONSTRAINT "${fk.constraint}" FOREIGN KEY ("${fk.column}") REFERENCES "users"("id") ON DELETE CASCADE`,
      );
    }

    for (const fk of this.setNullFks) {
      await queryRunner.query(
        `ALTER TABLE "${fk.table}" ALTER COLUMN "${fk.column}" DROP NOT NULL`,
      );
      await queryRunner.query(
        `ALTER TABLE "${fk.table}" DROP CONSTRAINT "${fk.constraint}"`,
      );
      await queryRunner.query(
        `ALTER TABLE "${fk.table}" ADD CONSTRAINT "${fk.constraint}" FOREIGN KEY ("${fk.column}") REFERENCES "users"("id") ON DELETE SET NULL`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const fk of this.setNullFks) {
      await queryRunner.query(
        `ALTER TABLE "${fk.table}" DROP CONSTRAINT "${fk.constraint}"`,
      );
      await queryRunner.query(
        `ALTER TABLE "${fk.table}" ADD CONSTRAINT "${fk.constraint}" FOREIGN KEY ("${fk.column}") REFERENCES "users"("id") ON DELETE NO ACTION`,
      );
      await queryRunner.query(
        `ALTER TABLE "${fk.table}" ALTER COLUMN "${fk.column}" SET NOT NULL`,
      );
    }

    for (const fk of this.cascadeFks) {
      await queryRunner.query(
        `ALTER TABLE "${fk.table}" DROP CONSTRAINT "${fk.constraint}"`,
      );
      await queryRunner.query(
        `ALTER TABLE "${fk.table}" ADD CONSTRAINT "${fk.constraint}" FOREIGN KEY ("${fk.column}") REFERENCES "users"("id") ON DELETE NO ACTION`,
      );
    }
  }
}
