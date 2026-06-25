import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { QuestionBankEntity } from './question-bank.entity';

@Entity('bank_tags')
export class BankTagEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @ManyToMany(() => QuestionBankEntity, (bank) => bank.tags)
  questionBanks!: QuestionBankEntity[];
}
