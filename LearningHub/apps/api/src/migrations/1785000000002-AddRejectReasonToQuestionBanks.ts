import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRejectReasonToQuestionBanks1785000000002
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'question_banks',
      new TableColumn({
        name: 'reject_reason',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('question_banks', 'reject_reason');
  }
}
