import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../../../auth/infrastructure/persistence/entities/user.entity';
import { BankTagEntity } from './bank-tag.entity';
import { QuestionBankStatusEntity } from './question-bank-status.entity';
import { QuestionBankUploadEntity } from './question-bank-upload.entity';
import { QuestionEntity } from './question.entity';

@Entity('question_banks')
export class QuestionBankEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true, type: 'text' })
  description!: string;

  @Column({ name: 'uploader_id', nullable: true })
  uploaderId!: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploader_id' })
  uploader!: UserEntity | null;

  @Column({ name: 'file_hash', nullable: true })
  fileHash!: string;

  @Column({ name: 'total_questions', default: 0 })
  totalQuestions!: number;

  @Column({ name: 'status_id' })
  statusId!: string;

  @Column({ name: 'reject_reason', nullable: true, type: 'text' })
  rejectReason!: string | null;

  @ManyToOne(() => QuestionBankStatusEntity, (status) => status.questionBanks)
  @JoinColumn({ name: 'status_id' })
  status!: QuestionBankStatusEntity;

  @ManyToMany(() => BankTagEntity, (tag) => tag.questionBanks)
  @JoinTable({
    name: 'question_bank_tags',
    joinColumn: { name: 'question_bank_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags!: BankTagEntity[];

  @OneToMany(() => QuestionEntity, (question) => question.questionBank)
  questions!: QuestionEntity[];

  @OneToMany(() => QuestionBankUploadEntity, (upload) => upload.questionBank)
  uploads!: QuestionBankUploadEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @Column({
    name: 'passing_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 60,
  })
  passingScore!: number;
  updatedAt!: Date;
}
