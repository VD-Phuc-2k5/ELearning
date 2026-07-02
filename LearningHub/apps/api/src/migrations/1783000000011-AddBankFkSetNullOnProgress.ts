import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBankFkSetNullOnProgress1783000000011
  implements MigrationInterface
{
  name = 'AddBankFkSetNullOnProgress1783000000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" DROP CONSTRAINT "FK_388e4326e4c6db6cb82044e1b85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "FK_388e4326e4c6db6cb82044e1b85" FOREIGN KEY ("current_bank_id") REFERENCES "question_banks"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" DROP CONSTRAINT "FK_388e4326e4c6db6cb82044e1b85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roadmap_progress" ADD CONSTRAINT "FK_388e4326e4c6db6cb82044e1b85" FOREIGN KEY ("current_bank_id") REFERENCES "question_banks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
