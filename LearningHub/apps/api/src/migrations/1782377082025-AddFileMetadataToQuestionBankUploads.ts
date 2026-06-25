import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFileMetadataToQuestionBankUploads1782377082025 implements MigrationInterface {
    name = 'AddFileMetadataToQuestionBankUploads1782377082025'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question_bank_uploads" ADD "file_name" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "question_bank_uploads" ADD "total_questions_imported" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question_bank_uploads" DROP COLUMN "total_questions_imported"`);
        await queryRunner.query(`ALTER TABLE "question_bank_uploads" DROP COLUMN "file_name"`);
    }

}
