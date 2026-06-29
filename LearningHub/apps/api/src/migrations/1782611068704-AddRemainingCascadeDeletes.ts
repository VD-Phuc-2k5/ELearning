import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRemainingCascadeDeletes1782611068704
  implements MigrationInterface
{
  name = 'AddRemainingCascadeDeletes1782611068704';

  /**
   * This migration was generated when quiz_attempt_answers already existed in dev DB.
   * That table is created (with correct CASCADE/SET NULL constraints) in migration 1783000000002.
   * correct_answers and question_difficult exist but we handle them here since they existed.
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update correct_answers FK (table exists at this point)
    await queryRunner.query(
      `ALTER TABLE "correct_answers" DROP CONSTRAINT "FK_6474c20a6f09ed8cbc9b4d94e43"`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" ADD CONSTRAINT "FK_6474c20a6f09ed8cbc9b4d94e43" FOREIGN KEY ("option_id") REFERENCES "answer_options"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Update question_difficult FK (table exists at this point)
    await queryRunner.query(
      `ALTER TABLE "question_difficult" DROP CONSTRAINT "FK_6a218204e64c83e1047c004c3d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_difficult" ADD CONSTRAINT "FK_6a218204e64c83e1047c004c3d5" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // NOTE: quiz_attempt_answers is created AFTER this migration (1783000000002)
    // so we skip altering its constraints here — they are set correctly at creation time.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "question_difficult" DROP CONSTRAINT "FK_6a218204e64c83e1047c004c3d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" DROP CONSTRAINT "FK_6474c20a6f09ed8cbc9b4d94e43"`,
    );

    await queryRunner.query(
      `ALTER TABLE "question_difficult" ADD CONSTRAINT "FK_6a218204e64c83e1047c004c3d5" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" ADD CONSTRAINT "FK_6474c20a6f09ed8cbc9b4d94e43" FOREIGN KEY ("option_id") REFERENCES "answer_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
