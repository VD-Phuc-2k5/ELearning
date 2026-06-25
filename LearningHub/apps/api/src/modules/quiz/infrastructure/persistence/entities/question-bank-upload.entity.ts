import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { UserEntity } from '../../../../auth/infrastructure/persistence/entities/user.entity';
import { QuestionBankEntity } from './question-bank.entity';

@Entity('question_bank_uploads')
export class QuestionBankUploadEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'question_bank_id' })
  questionBankId!: string;

  @ManyToOne(() => QuestionBankEntity, (bank) => bank.uploads)
  @JoinColumn({ name: 'question_bank_id' })
  questionBank!: QuestionBankEntity;

  @Column({ name: 'uploaded_by' })
  uploadedBy!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'uploaded_by' })
  uploader!: UserEntity;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt!: Date;
}
