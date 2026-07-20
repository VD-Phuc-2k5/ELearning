import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeDeleteToQuizEntities1782610330302
  implements MigrationInterface
{
  name = 'AddCascadeDeleteToQuizEntities1782610330302';

  /**
   * This migration was originally auto-generated when several tables already existed in dev DB
   * (roadmaps, quiz_attempts, user_bank_progress, user_roadmap_progress, passing_score column).
   * Those are handled by later migrations (1783000000001..1783000000004).
   *
   * Here we ONLY add CASCADE DELETE to the FK constraints of the quiz tables that
   * already exist at this point: question_bank_uploads, correct_answers, questions, answer_options.
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop non-cascade FK constraints
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" DROP CONSTRAINT "FK_4df94b305b373a0940b83a5c8a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" DROP CONSTRAINT "FK_1bae619311f6f63c219c3d066f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" DROP CONSTRAINT "FK_911b3cb63b93ffa9ba1b63c25e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer_options" DROP CONSTRAINT "FK_8162ab2d61e1aa77f41ea951dc9"`,
    );

    // Re-add with CASCADE DELETE
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" ADD CONSTRAINT "FK_4df94b305b373a0940b83a5c8a9" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" ADD CONSTRAINT "FK_1bae619311f6f63c219c3d066f3" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD CONSTRAINT "FK_911b3cb63b93ffa9ba1b63c25e0" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer_options" ADD CONSTRAINT "FK_8162ab2d61e1aa77f41ea951dc9" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove cascade FK constraints
    await queryRunner.query(
      `ALTER TABLE "answer_options" DROP CONSTRAINT "FK_8162ab2d61e1aa77f41ea951dc9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" DROP CONSTRAINT "FK_911b3cb63b93ffa9ba1b63c25e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" DROP CONSTRAINT "FK_1bae619311f6f63c219c3d066f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" DROP CONSTRAINT "FK_4df94b305b373a0940b83a5c8a9"`,
    );

    // Re-add original non-cascade FK constraints
    await queryRunner.query(
      `ALTER TABLE "answer_options" ADD CONSTRAINT "FK_8162ab2d61e1aa77f41ea951dc9" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD CONSTRAINT "FK_911b3cb63b93ffa9ba1b63c25e0" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" ADD CONSTRAINT "FK_1bae619311f6f63c219c3d066f3" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" ADD CONSTRAINT "FK_4df94b305b373a0940b83a5c8a9" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
