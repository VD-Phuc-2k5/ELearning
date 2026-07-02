import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeDeleteToRoadmapItem1782610764877
  implements MigrationInterface
{
  name = 'AddCascadeDeleteToRoadmapItem1782610764877';

  /**
   * This migration was generated when roadmap_items already existed in dev DB.
   * That table is created (with CASCADE DELETE on question_bank_id) in migration 1783000000001.
   * This migration is therefore a no-op when running fresh.
   */
  public async up(_: QueryRunner): Promise<void> {
    // no-op: roadmap_items.question_bank_id FK is created with CASCADE DELETE
    // directly in 1783000000001-CreateRoadmapTables
  }

  public async down(_: QueryRunner): Promise<void> {
    // no-op
  }
}
