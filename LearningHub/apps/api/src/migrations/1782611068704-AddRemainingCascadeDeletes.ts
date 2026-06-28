import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRemainingCascadeDeletes1782611068704
  implements MigrationInterface
{
  name = 'AddRemainingCascadeDeletes1782611068704';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "correct_answers" DROP CONSTRAINT "FK_6474c20a6f09ed8cbc9b4d94e43"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_difficult" DROP CONSTRAINT "FK_6a218204e64c83e1047c004c3d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" DROP CONSTRAINT "FK_c751cd10e70dd842ddebcfd15e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" DROP CONSTRAINT "FK_8aece94c843ae12e0698aa3b614"`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" ADD CONSTRAINT "FK_6474c20a6f09ed8cbc9b4d94e43" FOREIGN KEY ("option_id") REFERENCES "answer_options"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_difficult" ADD CONSTRAINT "FK_6a218204e64c83e1047c004c3d5" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_8aece94c843ae12e0698aa3b614" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_c751cd10e70dd842ddebcfd15e9" FOREIGN KEY ("selected_option_id") REFERENCES "answer_options"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" DROP CONSTRAINT "FK_c751cd10e70dd842ddebcfd15e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" DROP CONSTRAINT "FK_8aece94c843ae12e0698aa3b614"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_difficult" DROP CONSTRAINT "FK_6a218204e64c83e1047c004c3d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" DROP CONSTRAINT "FK_6474c20a6f09ed8cbc9b4d94e43"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_8aece94c843ae12e0698aa3b614" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_c751cd10e70dd842ddebcfd15e9" FOREIGN KEY ("selected_option_id") REFERENCES "answer_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_difficult" ADD CONSTRAINT "FK_6a218204e64c83e1047c004c3d5" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" ADD CONSTRAINT "FK_6474c20a6f09ed8cbc9b4d94e43" FOREIGN KEY ("option_id") REFERENCES "answer_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
