import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBankFkSetNullOnProgress1782610512970
  implements MigrationInterface
{
  name = 'AddBankFkSetNullOnProgress1782610512970';

  /**
   * This migration was generated when user_roadmap_progress already existed in dev DB.
   * That table is created (with the correct SET NULL constraint) in migration 1783000000003.
   * This migration is therefore a no-op when running fresh.
   */
  public async up(_: QueryRunner): Promise<void> {
    // no-op: user_roadmap_progress.current_bank_id FK is created with SET NULL
    // directly in 1783000000003-CreateUserProgressTables
  }

  public async down(_: QueryRunner): Promise<void> {
    // no-op
  }
}
