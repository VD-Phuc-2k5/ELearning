import { MigrationInterface, QueryRunner } from 'typeorm';

export class CascadeAllQuestionBankFks1784000000003
  implements MigrationInterface
{
  private readonly fks: Array<{
    table: string;
    constraint: string;
    column: string;
  }> = [
    {
      table: 'question_bank_tags',
      constraint: 'FK_e96d0df5c99e347a42d29948354',
      column: 'question_bank_id',
    },
    {
      table: 'question_bank_uploads',
      constraint: 'FK_4df94b305b373a0940b83a5c8a9',
      column: 'question_bank_id',
    },
    {
      table: 'questions',
      constraint: 'FK_911b3cb63b93ffa9ba1b63c25e0',
      column: 'question_bank_id',
    },
    {
      table: 'roadmap_items',
      constraint: 'FK_roadmap_items_bank',
      column: 'question_bank_id',
    },
    {
      table: 'user_bank_progress',
      constraint: 'FK_user_bank_progress_bank',
      column: 'question_bank_id',
    },
    {
      table: 'user_roadmap_progress',
      constraint: 'FK_user_roadmap_progress_current_bank',
      column: 'current_bank_id',
    },
    {
      table: 'user_roadmap_progress',
      constraint: 'FK_user_roadmap_progress_last_bank',
      column: 'last_accessed_bank_id',
    },
    {
      table: 'forum_posts',
      constraint: 'FK_forum_posts_question_bank',
      column: 'question_bank_id',
    },
    {
      table: 'quiz_attempts',
      constraint: 'FK_quiz_attempts_bank',
      column: 'question_bank_id',
    },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const fk of this.fks) {
      await queryRunner.query(`
        ALTER TABLE "${fk.table}"
        DROP CONSTRAINT "${fk.constraint}"
      `);
      await queryRunner.query(`
        ALTER TABLE "${fk.table}"
        ADD CONSTRAINT "${fk.constraint}"
        FOREIGN KEY ("${fk.column}")
        REFERENCES "question_banks"("id")
        ON DELETE CASCADE
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const fk of this.fks) {
      await queryRunner.query(`
        ALTER TABLE "${fk.table}"
        DROP CONSTRAINT "${fk.constraint}"
      `);
      await queryRunner.query(`
        ALTER TABLE "${fk.table}"
        ADD CONSTRAINT "${fk.constraint}"
        FOREIGN KEY ("${fk.column}")
        REFERENCES "question_banks"("id")
      `);
    }
  }
}
