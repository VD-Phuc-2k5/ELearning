import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1782785865197 implements MigrationInterface {
  name = 'Init1782785865197';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying, "resource" character varying NOT NULL, "action" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8dad765629e83229da6feda1c1d" UNIQUE ("code"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "username" character varying NOT NULL, "avatarUrl" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "lockedAt" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tokenHash" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "revokedAt" TIMESTAMP, "user_id" uuid, CONSTRAINT "UQ_c25bc63d248ca90e8dcc1d92d06" UNIQUE ("tokenHash"), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_roles" ("id" SERIAL NOT NULL, "user_id" uuid, "role_id" integer, "assignedAt" TIMESTAMP NOT NULL DEFAULT now(), "assigned_by" uuid, CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f6d54f95c31b73fb1bdd8e91d0c" UNIQUE ("code"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions" ("id" SERIAL NOT NULL, "role_id" integer, "permission_id" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_84059017c90bfcb701b8fa42297" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_permissions" ("id" SERIAL NOT NULL, "user_id" uuid, "permission_id" integer, "isGranted" boolean NOT NULL DEFAULT true, "grantedAt" TIMESTAMP NOT NULL DEFAULT now(), "granted_by" uuid, CONSTRAINT "PK_01f4295968ba33d73926684264f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bank_tags" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_f31dac5ffa295a78355fe881d69" UNIQUE ("name"), CONSTRAINT "PK_6ca0d588733b73c102bfa4af14f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "question_bank_status" ("id" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "PK_3aa0dce798db80f7c423fa68fc9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "question_bank_uploads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question_bank_id" uuid NOT NULL, "uploaded_by" uuid NOT NULL, "uploaded_at" TIMESTAMP NOT NULL DEFAULT now(), "file_name" character varying(255), "total_questions_imported" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_61b1866e1f5cba84f60795f7084" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "question_banks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "uploader_id" uuid NOT NULL, "file_hash" character varying, "total_questions" integer NOT NULL DEFAULT '0', "status_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "passing_score" numeric(5,2) NOT NULL DEFAULT '60', CONSTRAINT "PK_3127eb30f219cd0d40478ec5964" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "correct_answers" ("question_id" uuid NOT NULL, "option_id" uuid NOT NULL, CONSTRAINT "PK_138e7983280229a82ef1a6188f3" PRIMARY KEY ("question_id", "option_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "question_difficult" ("id" SERIAL NOT NULL, "question_id" uuid NOT NULL, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "PK_3fc71c0d0176c7f83773d8b6f56" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question_bank_id" uuid NOT NULL, "content" text NOT NULL, "explanation" text, CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "answer_options" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question_id" uuid NOT NULL, "option_label" character varying(1) NOT NULL, "content" text NOT NULL, CONSTRAINT "PK_6f7aad84d76ce387af24c1231cb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "quiz_attempts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "question_bank_id" uuid NOT NULL, "started_at" TIMESTAMP NOT NULL, "finished_at" TIMESTAMP, "duration_seconds" integer, "score_percent" numeric(5,2), "correct_count" integer NOT NULL DEFAULT '0', "wrong_count" integer NOT NULL DEFAULT '0', "total_questions" integer NOT NULL DEFAULT '0', "status" character varying NOT NULL DEFAULT 'in_progress', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a84a93fb092359516dc5b325b90" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "quiz_attempt_answers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "attempt_id" uuid NOT NULL, "question_id" uuid NOT NULL, "selected_option_id" uuid, "is_correct" boolean NOT NULL DEFAULT false, "time_spent_seconds" integer, "question_order" integer NOT NULL, CONSTRAINT "PK_876afc52bb7dd208ae7ce3ec6ff" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_bank_progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "question_bank_id" uuid NOT NULL, "attempt_count" integer NOT NULL DEFAULT '0', "best_score" numeric(5,2), "latest_score" numeric(5,2), "is_completed" boolean NOT NULL DEFAULT false, "completed_at" TIMESTAMP, "first_attempt_at" TIMESTAMP, "last_accessed_at" TIMESTAMP, CONSTRAINT "PK_2bd8116a43522669e0d87298ddb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roadmaps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "creator_id" uuid NOT NULL, "status" character varying NOT NULL DEFAULT 'draft', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9b0d527f9c64d15405c21e7ca54" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roadmap_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "roadmap_id" uuid NOT NULL, "question_bank_id" uuid NOT NULL, "position" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e5d959c8ec2deabd242d10e640e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_roadmap_progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "roadmap_id" uuid NOT NULL, "total_banks" integer NOT NULL DEFAULT '0', "completed_banks" integer NOT NULL DEFAULT '0', "progress_percent" numeric(5,2) NOT NULL DEFAULT '0', "status" character varying NOT NULL DEFAULT 'not_started', "current_bank_id" uuid, "last_accessed_bank_id" character varying, "started_at" TIMESTAMP, "last_accessed_at" TIMESTAMP, "completed_at" TIMESTAMP, CONSTRAINT "PK_e98e553063540032747912b0dc2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "question_bank_tags" ("question_bank_id" uuid NOT NULL, "tag_id" integer NOT NULL, CONSTRAINT "PK_c55f2f34b4a77607eecbe8ae39b" PRIMARY KEY ("question_bank_id", "tag_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e96d0df5c99e347a42d2994835" ON "question_bank_tags"  ("question_bank_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0080ed5370dd9cb8fe58893bf0" ON "question_bank_tags"  ("tag_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_6de6fefffe4a6d17de747bf8b9d" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permissions" ADD CONSTRAINT "FK_3495bd31f1862d02931e8e8d2e8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permissions" ADD CONSTRAINT "FK_8145f5fadacd311693c15e41f10" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permissions" ADD CONSTRAINT "FK_ef71071c7832d547c1b966a20c3" FOREIGN KEY ("granted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" ADD CONSTRAINT "FK_4df94b305b373a0940b83a5c8a9" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" ADD CONSTRAINT "FK_500134d04b03e176aa602d65375" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" ADD CONSTRAINT "FK_03d3707d8139feab1d62a6f6d7d" FOREIGN KEY ("uploader_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" ADD CONSTRAINT "FK_a476d46d5d0ef7de7a62a776b6e" FOREIGN KEY ("status_id") REFERENCES "question_bank_status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" ADD CONSTRAINT "FK_1bae619311f6f63c219c3d066f3" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" ADD CONSTRAINT "FK_6474c20a6f09ed8cbc9b4d94e43" FOREIGN KEY ("option_id") REFERENCES "answer_options"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_difficult" ADD CONSTRAINT "FK_6a218204e64c83e1047c004c3d5" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
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
      `ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_8aece94c843ae12e0698aa3b614" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_c751cd10e70dd842ddebcfd15e9" FOREIGN KEY ("selected_option_id") REFERENCES "answer_options"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
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
      `ALTER TABLE "roadmap_items" ADD CONSTRAINT "FK_43ac131fb57225ad391d62253e9" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "FK_52907d6297d1057593f203aed9b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "FK_918fef5517cf82309df4d4d3591" FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "FK_388e4326e4c6db6cb82044e1b85" FOREIGN KEY ("current_bank_id") REFERENCES "question_banks"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" ADD CONSTRAINT "FK_e96d0df5c99e347a42d29948354" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" ADD CONSTRAINT "FK_0080ed5370dd9cb8fe58893bf0a" FOREIGN KEY ("tag_id") REFERENCES "bank_tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" DROP CONSTRAINT "FK_0080ed5370dd9cb8fe58893bf0a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" DROP CONSTRAINT "FK_e96d0df5c99e347a42d29948354"`,
    );
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
      `ALTER TABLE "question_difficult" DROP CONSTRAINT "FK_6a218204e64c83e1047c004c3d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" DROP CONSTRAINT "FK_6474c20a6f09ed8cbc9b4d94e43"`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" DROP CONSTRAINT "FK_1bae619311f6f63c219c3d066f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" DROP CONSTRAINT "FK_a476d46d5d0ef7de7a62a776b6e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" DROP CONSTRAINT "FK_03d3707d8139feab1d62a6f6d7d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" DROP CONSTRAINT "FK_500134d04b03e176aa602d65375"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" DROP CONSTRAINT "FK_4df94b305b373a0940b83a5c8a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permissions" DROP CONSTRAINT "FK_ef71071c7832d547c1b966a20c3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permissions" DROP CONSTRAINT "FK_8145f5fadacd311693c15e41f10"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permissions" DROP CONSTRAINT "FK_3495bd31f1862d02931e8e8d2e8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_178199805b901ccd220ab7740ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_6de6fefffe4a6d17de747bf8b9d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0080ed5370dd9cb8fe58893bf0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e96d0df5c99e347a42d2994835"`,
    );
    await queryRunner.query(`DROP TABLE "question_bank_tags"`);
    await queryRunner.query(`DROP TABLE "user_roadmap_progress"`);
    await queryRunner.query(`DROP TABLE "roadmap_items"`);
    await queryRunner.query(`DROP TABLE "roadmaps"`);
    await queryRunner.query(`DROP TABLE "user_bank_progress"`);
    await queryRunner.query(`DROP TABLE "quiz_attempt_answers"`);
    await queryRunner.query(`DROP TABLE "quiz_attempts"`);
    await queryRunner.query(`DROP TABLE "answer_options"`);
    await queryRunner.query(`DROP TABLE "questions"`);
    await queryRunner.query(`DROP TABLE "question_difficult"`);
    await queryRunner.query(`DROP TABLE "correct_answers"`);
    await queryRunner.query(`DROP TABLE "question_banks"`);
    await queryRunner.query(`DROP TABLE "question_bank_uploads"`);
    await queryRunner.query(`DROP TABLE "question_bank_status"`);
    await queryRunner.query(`DROP TABLE "bank_tags"`);
    await queryRunner.query(`DROP TABLE "user_permissions"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
  }
}
