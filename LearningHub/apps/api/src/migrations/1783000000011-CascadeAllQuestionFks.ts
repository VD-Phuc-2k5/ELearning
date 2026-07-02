import { MigrationInterface, QueryRunner } from 'typeorm';

export class CascadeAllQuestionFks1783000000011 implements MigrationInterface {
  private readonly fks: Array<{
    table: string;
    constraint: string;
    column: string;
  }> = [
    {
      table: 'correct_answers',
      constraint: 'FK_1bae619311f6f63c219c3d066f3',
      column: 'question_id',
    },
    {
      table: 'answer_options',
      constraint: 'FK_8162ab2d61e1aa77f41ea951dc9',
      column: 'question_id',
    },
    {
      table: 'quiz_attempt_answers',
      constraint: 'FK_quiz_attempt_answers_question',
      column: 'question_id',
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
        REFERENCES "questions"("id")
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
        REFERENCES "questions"("id")
      `);
    }
  }
}
