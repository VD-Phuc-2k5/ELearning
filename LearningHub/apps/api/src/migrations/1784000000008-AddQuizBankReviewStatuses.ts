import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuizBankReviewStatuses1784000000008
  implements MigrationInterface
{
  name = 'AddQuizBankReviewStatuses1784000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "question_bank_status" ("id", "name", "description")
      VALUES
        ('pending_review', 'Pending Review', 'Chờ kiểm duyệt'),
        ('approved', 'Approved', 'Đã duyệt')
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "question_bank_status" WHERE "id" IN ('pending_review', 'approved')
    `);
  }
}
