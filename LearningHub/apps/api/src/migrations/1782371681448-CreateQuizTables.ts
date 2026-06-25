import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateQuizTables1782371681448 implements MigrationInterface {
    name = 'CreateQuizTables1782371681448'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bank_tags" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_f31dac5ffa295a78355fe881d69" UNIQUE ("name"), CONSTRAINT "PK_6ca0d588733b73c102bfa4af14f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "question_bank_status" ("id" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "PK_3aa0dce798db80f7c423fa68fc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "question_bank_uploads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question_bank_id" uuid NOT NULL, "uploaded_by" uuid NOT NULL, "uploaded_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_61b1866e1f5cba84f60795f7084" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "question_banks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "uploader_id" uuid NOT NULL, "file_hash" character varying, "total_questions" integer NOT NULL DEFAULT '0', "status_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3127eb30f219cd0d40478ec5964" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "correct_answers" ("question_id" uuid NOT NULL, "option_id" uuid NOT NULL, CONSTRAINT "PK_138e7983280229a82ef1a6188f3" PRIMARY KEY ("question_id", "option_id"))`);
        await queryRunner.query(`CREATE TABLE "question_difficult" ("id" SERIAL NOT NULL, "question_id" uuid NOT NULL, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "PK_3fc71c0d0176c7f83773d8b6f56" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question_bank_id" uuid NOT NULL, "content" text NOT NULL, "explanation" text, CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "answer_options" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question_id" uuid NOT NULL, "option_label" character varying(1) NOT NULL, "content" text NOT NULL, CONSTRAINT "PK_6f7aad84d76ce387af24c1231cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "question_bank_tags" ("question_bank_id" uuid NOT NULL, "tag_id" integer NOT NULL, CONSTRAINT "PK_c55f2f34b4a77607eecbe8ae39b" PRIMARY KEY ("question_bank_id", "tag_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e96d0df5c99e347a42d2994835" ON "question_bank_tags"  ("question_bank_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_0080ed5370dd9cb8fe58893bf0" ON "question_bank_tags"  ("tag_id") `);
        await queryRunner.query(`ALTER TABLE "question_bank_uploads" ADD CONSTRAINT "FK_4df94b305b373a0940b83a5c8a9" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question_bank_uploads" ADD CONSTRAINT "FK_500134d04b03e176aa602d65375" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question_banks" ADD CONSTRAINT "FK_03d3707d8139feab1d62a6f6d7d" FOREIGN KEY ("uploader_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question_banks" ADD CONSTRAINT "FK_a476d46d5d0ef7de7a62a776b6e" FOREIGN KEY ("status_id") REFERENCES "question_bank_status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "correct_answers" ADD CONSTRAINT "FK_1bae619311f6f63c219c3d066f3" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "correct_answers" ADD CONSTRAINT "FK_6474c20a6f09ed8cbc9b4d94e43" FOREIGN KEY ("option_id") REFERENCES "answer_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question_difficult" ADD CONSTRAINT "FK_6a218204e64c83e1047c004c3d5" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_911b3cb63b93ffa9ba1b63c25e0" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answer_options" ADD CONSTRAINT "FK_8162ab2d61e1aa77f41ea951dc9" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question_bank_tags" ADD CONSTRAINT "FK_e96d0df5c99e347a42d29948354" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "question_bank_tags" ADD CONSTRAINT "FK_0080ed5370dd9cb8fe58893bf0a" FOREIGN KEY ("tag_id") REFERENCES "bank_tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`INSERT INTO "question_bank_status" ("id", "name", "description") VALUES ('draft', 'Draft', 'Nháp'), ('published', 'Published', 'Đã xuất bản'), ('archived', 'Archived', 'Lưu trữ') ON CONFLICT DO NOTHING`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question_bank_tags" DROP CONSTRAINT "FK_0080ed5370dd9cb8fe58893bf0a"`);
        await queryRunner.query(`ALTER TABLE "question_bank_tags" DROP CONSTRAINT "FK_e96d0df5c99e347a42d29948354"`);
        await queryRunner.query(`ALTER TABLE "answer_options" DROP CONSTRAINT "FK_8162ab2d61e1aa77f41ea951dc9"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_911b3cb63b93ffa9ba1b63c25e0"`);
        await queryRunner.query(`ALTER TABLE "question_difficult" DROP CONSTRAINT "FK_6a218204e64c83e1047c004c3d5"`);
        await queryRunner.query(`ALTER TABLE "correct_answers" DROP CONSTRAINT "FK_6474c20a6f09ed8cbc9b4d94e43"`);
        await queryRunner.query(`ALTER TABLE "correct_answers" DROP CONSTRAINT "FK_1bae619311f6f63c219c3d066f3"`);
        await queryRunner.query(`ALTER TABLE "question_banks" DROP CONSTRAINT "FK_a476d46d5d0ef7de7a62a776b6e"`);
        await queryRunner.query(`ALTER TABLE "question_banks" DROP CONSTRAINT "FK_03d3707d8139feab1d62a6f6d7d"`);
        await queryRunner.query(`ALTER TABLE "question_bank_uploads" DROP CONSTRAINT "FK_500134d04b03e176aa602d65375"`);
        await queryRunner.query(`ALTER TABLE "question_bank_uploads" DROP CONSTRAINT "FK_4df94b305b373a0940b83a5c8a9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0080ed5370dd9cb8fe58893bf0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e96d0df5c99e347a42d2994835"`);
        await queryRunner.query(`DROP TABLE "question_bank_tags"`);
        await queryRunner.query(`DROP TABLE "answer_options"`);
        await queryRunner.query(`DROP TABLE "questions"`);
        await queryRunner.query(`DROP TABLE "question_difficult"`);
        await queryRunner.query(`DROP TABLE "correct_answers"`);
        await queryRunner.query(`DROP TABLE "question_banks"`);
        await queryRunner.query(`DROP TABLE "question_bank_uploads"`);
        await queryRunner.query(`DROP TABLE "question_bank_status"`);
        await queryRunner.query(`DROP TABLE "bank_tags"`);
    }

}
