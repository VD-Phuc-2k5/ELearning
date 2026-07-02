import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1782785446699 implements MigrationInterface {
  name = 'Init1782785446699';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" DROP CONSTRAINT "question_bank_uploads_questionbankid_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" DROP CONSTRAINT "question_bank_uploads_uploadedby_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" DROP CONSTRAINT "question_banks_uploaderid_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" DROP CONSTRAINT "question_banks_status_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" DROP CONSTRAINT "correct_answers_questionid_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" DROP CONSTRAINT "correct_answers_optionid_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" DROP CONSTRAINT "questions_questionbankid_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" DROP CONSTRAINT "questions_difficultid_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer_options" DROP CONSTRAINT "answer_options_questionid_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" DROP CONSTRAINT "question_bank_tags_tagid_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" DROP CONSTRAINT "question_bank_tags_questionbankid_fkey"`,
    );
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying, "resource" character varying NOT NULL, "action" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8dad765629e83229da6feda1c1d" UNIQUE ("code"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
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
      `CREATE TABLE "quiz_attempt_answers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "attempt_id" uuid NOT NULL, "question_id" uuid NOT NULL, "selected_option_id" uuid, "is_correct" boolean NOT NULL DEFAULT false, "time_spent_seconds" integer, "question_order" integer NOT NULL, CONSTRAINT "PK_876afc52bb7dd208ae7ce3ec6ff" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "quiz_attempts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "question_bank_id" uuid NOT NULL, "started_at" TIMESTAMP NOT NULL, "finished_at" TIMESTAMP, "duration_seconds" integer, "score_percent" numeric(5,2), "correct_count" integer NOT NULL DEFAULT '0', "wrong_count" integer NOT NULL DEFAULT '0', "total_questions" integer NOT NULL DEFAULT '0', "status" character varying NOT NULL DEFAULT 'in_progress', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a84a93fb092359516dc5b325b90" PRIMARY KEY ("id"))`,
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
      `ALTER TABLE "question_bank_uploads" DROP COLUMN "questionbankid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" DROP COLUMN "uploadedby"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" DROP COLUMN "uploadedat"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" DROP COLUMN "uploaderid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" DROP COLUMN "totalquestions"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" DROP COLUMN "createdat"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" DROP COLUMN "updatedat"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" DROP COLUMN "status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" DROP COLUMN "filehash"`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" DROP CONSTRAINT "correct_answers_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" ADD CONSTRAINT "correct_answers_pkey" PRIMARY KEY ("questionid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" DROP COLUMN "optionid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" DROP CONSTRAINT "correct_answers_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" DROP COLUMN "questionid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" DROP COLUMN "questionbankid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" DROP COLUMN "difficultid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer_options" DROP COLUMN "questionid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer_options" DROP COLUMN "optionlabel"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" DROP CONSTRAINT "question_bank_tags_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" ADD CONSTRAINT "question_bank_tags_pkey" PRIMARY KEY ("questionbankid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" DROP COLUMN "tagid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" DROP CONSTRAINT "question_bank_tags_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" DROP COLUMN "questionbankid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" ADD "question_bank_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" ADD "uploaded_by" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" ADD "uploaded_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" ADD "file_name" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" ADD "total_questions_imported" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" ADD "uploader_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" ADD "file_hash" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" ADD "total_questions" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" ADD "status_id" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" ADD "passing_score" numeric(5,2) NOT NULL DEFAULT '60'`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" ADD "question_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" ADD CONSTRAINT "PK_1bae619311f6f63c219c3d066f3" PRIMARY KEY ("question_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" ADD "option_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" DROP CONSTRAINT "PK_1bae619311f6f63c219c3d066f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" ADD CONSTRAINT "PK_138e7983280229a82ef1a6188f3" PRIMARY KEY ("question_id", "option_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_difficult" ADD "question_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD "question_bank_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer_options" ADD "question_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer_options" ADD "option_label" character varying(1) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" ADD "question_bank_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" ADD CONSTRAINT "PK_e96d0df5c99e347a42d29948354" PRIMARY KEY ("question_bank_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" ADD "tag_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" DROP CONSTRAINT "PK_e96d0df5c99e347a42d29948354"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" ADD CONSTRAINT "PK_c55f2f34b4a77607eecbe8ae39b" PRIMARY KEY ("question_bank_id", "tag_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "users_email_key"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "email" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "password" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "username" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatarUrl"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "avatarUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "isActive" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lockedAt"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "lockedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "bank_tags" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "bank_tags" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "bank_tags" ADD CONSTRAINT "UQ_f31dac5ffa295a78355fe881d69" UNIQUE ("name")`,
    );
    await queryRunner.query(
      `ALTER TABLE "bank_tags" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bank_tags" ADD "description" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_status" DROP CONSTRAINT "question_bank_status_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_status" DROP COLUMN "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_status" ADD "id" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_status" ADD CONSTRAINT "PK_3aa0dce798db80f7c423fa68fc9" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_status" DROP COLUMN "name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_status" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_status" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_status" ADD "description" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "question_banks" DROP COLUMN "title"`);
    await queryRunner.query(
      `ALTER TABLE "question_banks" ADD "title" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_difficult" DROP COLUMN "name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_difficult" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_difficult" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_difficult" ADD "description" character varying`,
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
      `ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_5637534756d07a1f243d1517c10" FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_8aece94c843ae12e0698aa3b614" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_c751cd10e70dd842ddebcfd15e9" FOREIGN KEY ("selected_option_id") REFERENCES "answer_options"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" ADD CONSTRAINT "FK_1701aaf48f6a78e96bfe08dd395" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" ADD CONSTRAINT "FK_4a83f0e71278764116e60c52811" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
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
      `ALTER TABLE "quiz_attempts" DROP CONSTRAINT "FK_4a83f0e71278764116e60c52811"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" DROP CONSTRAINT "FK_1701aaf48f6a78e96bfe08dd395"`,
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
    await queryRunner.query(
      `ALTER TABLE "question_difficult" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_difficult" ADD "description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_difficult" DROP COLUMN "name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_difficult" ADD "name" character varying(100) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "question_banks" DROP COLUMN "title"`);
    await queryRunner.query(
      `ALTER TABLE "question_banks" ADD "title" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_status" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_status" ADD "description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_status" DROP COLUMN "name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_status" ADD "name" character varying(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_status" DROP CONSTRAINT "PK_3aa0dce798db80f7c423fa68fc9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_status" DROP COLUMN "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_status" ADD "id" character varying(50) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_status" ADD CONSTRAINT "question_bank_status_pkey" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "bank_tags" DROP COLUMN "description"`,
    );
    await queryRunner.query(`ALTER TABLE "bank_tags" ADD "description" text`);
    await queryRunner.query(
      `ALTER TABLE "bank_tags" DROP CONSTRAINT "UQ_f31dac5ffa295a78355fe881d69"`,
    );
    await queryRunner.query(`ALTER TABLE "bank_tags" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "bank_tags" ADD "name" character varying(100) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lockedAt"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "lockedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "isActive" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatarUrl"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "avatarUrl" text`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "username" character varying(100) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "password" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "email" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "users_email_key" UNIQUE ("email")`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" DROP CONSTRAINT "PK_c55f2f34b4a77607eecbe8ae39b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" ADD CONSTRAINT "PK_e96d0df5c99e347a42d29948354" PRIMARY KEY ("question_bank_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" DROP COLUMN "tag_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" DROP CONSTRAINT "PK_e96d0df5c99e347a42d29948354"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" DROP COLUMN "question_bank_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer_options" DROP COLUMN "option_label"`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer_options" DROP COLUMN "question_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" DROP COLUMN "question_bank_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_difficult" DROP COLUMN "question_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" DROP CONSTRAINT "PK_138e7983280229a82ef1a6188f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" ADD CONSTRAINT "PK_1bae619311f6f63c219c3d066f3" PRIMARY KEY ("question_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" DROP COLUMN "option_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" DROP CONSTRAINT "PK_1bae619311f6f63c219c3d066f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" DROP COLUMN "question_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" DROP COLUMN "passing_score"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" DROP COLUMN "status_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" DROP COLUMN "total_questions"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" DROP COLUMN "file_hash"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" DROP COLUMN "uploader_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" DROP COLUMN "total_questions_imported"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" DROP COLUMN "file_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" DROP COLUMN "uploaded_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" DROP COLUMN "uploaded_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" DROP COLUMN "question_bank_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" ADD "questionbankid" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" ADD CONSTRAINT "question_bank_tags_pkey" PRIMARY KEY ("questionbankid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" ADD "tagid" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" DROP CONSTRAINT "question_bank_tags_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" ADD CONSTRAINT "question_bank_tags_pkey" PRIMARY KEY ("tagid", "questionbankid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer_options" ADD "optionlabel" character varying(10) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer_options" ADD "questionid" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD "difficultid" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD "questionbankid" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" ADD "questionid" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" ADD CONSTRAINT "correct_answers_pkey" PRIMARY KEY ("questionid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" ADD "optionid" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" DROP CONSTRAINT "correct_answers_pkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" ADD CONSTRAINT "correct_answers_pkey" PRIMARY KEY ("optionid", "questionid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" ADD "filehash" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" ADD "status" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" ADD "updatedat" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" ADD "createdat" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" ADD "totalquestions" integer DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" ADD "uploaderid" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" ADD "uploadedat" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" ADD "uploadedby" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" ADD "questionbankid" uuid`,
    );
    await queryRunner.query(`DROP TABLE "user_roadmap_progress"`);
    await queryRunner.query(`DROP TABLE "roadmap_items"`);
    await queryRunner.query(`DROP TABLE "roadmaps"`);
    await queryRunner.query(`DROP TABLE "user_bank_progress"`);
    await queryRunner.query(`DROP TABLE "quiz_attempts"`);
    await queryRunner.query(`DROP TABLE "quiz_attempt_answers"`);
    await queryRunner.query(`DROP TABLE "user_permissions"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" ADD CONSTRAINT "question_bank_tags_questionbankid_fkey" FOREIGN KEY ("questionbankid") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_tags" ADD CONSTRAINT "question_bank_tags_tagid_fkey" FOREIGN KEY ("tagid") REFERENCES "bank_tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer_options" ADD CONSTRAINT "answer_options_questionid_fkey" FOREIGN KEY ("questionid") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD CONSTRAINT "questions_difficultid_fkey" FOREIGN KEY ("difficultid") REFERENCES "question_difficult"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD CONSTRAINT "questions_questionbankid_fkey" FOREIGN KEY ("questionbankid") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" ADD CONSTRAINT "correct_answers_optionid_fkey" FOREIGN KEY ("optionid") REFERENCES "answer_options"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "correct_answers" ADD CONSTRAINT "correct_answers_questionid_fkey" FOREIGN KEY ("questionid") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" ADD CONSTRAINT "question_banks_status_fkey" FOREIGN KEY ("status") REFERENCES "question_bank_status"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_banks" ADD CONSTRAINT "question_banks_uploaderid_fkey" FOREIGN KEY ("uploaderid") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" ADD CONSTRAINT "question_bank_uploads_uploadedby_fkey" FOREIGN KEY ("uploadedby") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_bank_uploads" ADD CONSTRAINT "question_bank_uploads_questionbankid_fkey" FOREIGN KEY ("questionbankid") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
