import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeDeleteToRoadmapItem1783000000012
  implements MigrationInterface
{
  name = 'AddCascadeDeleteToRoadmapItem1783000000012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" DROP CONSTRAINT "FK_43ac131fb57225ad391d62253e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" ADD CONSTRAINT "FK_43ac131fb57225ad391d62253e9" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" DROP CONSTRAINT "FK_43ac131fb57225ad391d62253e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" ADD CONSTRAINT "FK_43ac131fb57225ad391d62253e9" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
