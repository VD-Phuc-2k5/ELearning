import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { QuestionBankEntity } from './question-bank.entity';

@Entity('question_bank_status')
export class QuestionBankStatusEntity {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @OneToMany(() => QuestionBankEntity, (bank) => bank.status)
  questionBanks!: QuestionBankEntity[];
}
