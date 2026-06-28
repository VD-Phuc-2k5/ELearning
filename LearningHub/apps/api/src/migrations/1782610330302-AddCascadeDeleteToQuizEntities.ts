import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeDeleteToQuizEntities1782610330302
  implements MigrationInterface
{
  name = 'AddCascadeDeleteToQuizEntities1782610330302';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" DROP CONSTRAINT "FK_quiz_attempts_bank"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" DROP CONSTRAINT "FK_quiz_attempts_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" DROP CONSTRAINT "FK_quiz_attempt_answers_option"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" DROP CONSTRAINT "FK_quiz_attempt_answers_question"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" DROP CONSTRAINT "FK_quiz_attempt_answers_attempt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bank_progress" DROP CONSTRAINT "FK_user_bank_progress_bank"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bank_progress" DROP CONSTRAINT "FK_user_bank_progress_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmaps" DROP CONSTRAINT "FK_roadmaps_creator"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" DROP CONSTRAINT "FK_roadmap_items_bank"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" DROP CONSTRAINT "FK_roadmap_items_roadmap"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" DROP CONSTRAINT "FK_user_roadmap_progress_last_bank"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" DROP CONSTRAINT "FK_user_roadmap_progress_current_bank"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" DROP CONSTRAINT "FK_user_roadmap_progress_roadmap"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" DROP CONSTRAINT "FK_user_roadmap_progress_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_quiz_attempts_user_bank"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_quiz_attempts_user_created"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_quiz_attempt_answers_attempt"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_roadmaps_creator_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_roadmaps_status"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_roadmap_items_roadmap_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bank_progress" DROP CONSTRAINT "UQ_user_bank_progress"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" DROP CONSTRAINT "UQ_roadmap_items_bank"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" DROP CONSTRAINT "UQ_user_roadmap_progress"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" ALTER COLUMN "passing_score" SET DEFAULT '60'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" DROP COLUMN "last_accessed_bank_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD "last_accessed_bank_id" character varying`,
    );
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
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" ADD CONSTRAINT "FK_1701aaf48f6a78e96bfe08dd395" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" ADD CONSTRAINT "FK_4a83f0e71278764116e60c52811" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_5637534756d07a1f243d1517c10" FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_8aece94c843ae12e0698aa3b614" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_c751cd10e70dd842ddebcfd15e9" FOREIGN KEY ("selected_option_id") REFERENCES "answer_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bank_progress" ADD CONSTRAINT "FK_23dd604e6fad1632aa94e326c0d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bank_progress" ADD CONSTRAINT "FK_245fbe3338c97bf1c5a03d8c327" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmaps" ADD CONSTRAINT "FK_d3f6fcd5c48ebd4940bfcbb8afb" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" ADD CONSTRAINT "FK_7e316ee924d1227bfd4062d1476" FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" ADD CONSTRAINT "FK_43ac131fb57225ad391d62253e9" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "FK_52907d6297d1057593f203aed9b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "FK_918fef5517cf82309df4d4d3591" FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "FK_388e4326e4c6db6cb82044e1b85" FOREIGN KEY ("current_bank_id") REFERENCES "question_banks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" DROP CONSTRAINT "FK_388e4326e4c6db6cb82044e1b85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" DROP CONSTRAINT "FK_918fef5517cf82309df4d4d3591"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" DROP CONSTRAINT "FK_52907d6297d1057593f203aed9b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" DROP CONSTRAINT "FK_43ac131fb57225ad391d62253e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" DROP CONSTRAINT "FK_7e316ee924d1227bfd4062d1476"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmaps" DROP CONSTRAINT "FK_d3f6fcd5c48ebd4940bfcbb8afb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bank_progress" DROP CONSTRAINT "FK_245fbe3338c97bf1c5a03d8c327"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bank_progress" DROP CONSTRAINT "FK_23dd604e6fad1632aa94e326c0d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" DROP CONSTRAINT "FK_c751cd10e70dd842ddebcfd15e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" DROP CONSTRAINT "FK_8aece94c843ae12e0698aa3b614"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" DROP CONSTRAINT "FK_5637534756d07a1f243d1517c10"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" DROP CONSTRAINT "FK_4a83f0e71278764116e60c52811"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" DROP CONSTRAINT "FK_1701aaf48f6a78e96bfe08dd395"`,
    );
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
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" DROP COLUMN "last_accessed_bank_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD "last_accessed_bank_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" ALTER COLUMN "passing_score" SET DEFAULT 60.00`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "UQ_user_roadmap_progress" UNIQUE ("user_id", "roadmap_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" ADD CONSTRAINT "UQ_roadmap_items_bank" UNIQUE ("roadmap_id", "question_bank_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bank_progress" ADD CONSTRAINT "UQ_user_bank_progress" UNIQUE ("user_id", "question_bank_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_roadmap_items_roadmap_id" ON "roadmap_items" USING btree ("position", "roadmap_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_roadmaps_status" ON "roadmaps" USING btree ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_roadmaps_creator_id" ON "roadmaps" USING btree ("creator_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_quiz_attempt_answers_attempt" ON "quiz_attempt_answers" USING btree ("attempt_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_quiz_attempts_user_created" ON "quiz_attempts" USING btree ("created_at", "user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_quiz_attempts_user_bank" ON "quiz_attempts" USING btree ("question_bank_id", "user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "FK_user_roadmap_progress_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "FK_user_roadmap_progress_roadmap" FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "FK_user_roadmap_progress_current_bank" FOREIGN KEY ("current_bank_id") REFERENCES "question_banks"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "FK_user_roadmap_progress_last_bank" FOREIGN KEY ("last_accessed_bank_id") REFERENCES "question_banks"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" ADD CONSTRAINT "FK_roadmap_items_roadmap" FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" ADD CONSTRAINT "FK_roadmap_items_bank" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmaps" ADD CONSTRAINT "FK_roadmaps_creator" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bank_progress" ADD CONSTRAINT "FK_user_bank_progress_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bank_progress" ADD CONSTRAINT "FK_user_bank_progress_bank" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_quiz_attempt_answers_attempt" FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_quiz_attempt_answers_question" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_quiz_attempt_answers_option" FOREIGN KEY ("selected_option_id") REFERENCES "answer_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" ADD CONSTRAINT "FK_quiz_attempts_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" ADD CONSTRAINT "FK_quiz_attempts_bank" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
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
