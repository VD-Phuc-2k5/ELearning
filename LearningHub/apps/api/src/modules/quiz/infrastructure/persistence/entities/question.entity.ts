import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuestionBankEntity } from './question-bank.entity';
import { AnswerOptionEntity } from './answer-option.entity';
import { CorrectAnswerEntity } from './correct-answer.entity';

@Entity('questions')
export class QuestionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'question_bank_id' })
  questionBankId!: string;

  @ManyToOne(() => QuestionBankEntity, (bank) => bank.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_bank_id' })
  questionBank!: QuestionBankEntity;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'text', nullable: true })
  explanation!: string;

  @OneToMany(() => AnswerOptionEntity, (option) => option.question, {
    cascade: true,
  })
  answerOptions!: AnswerOptionEntity[];

  @OneToMany(() => CorrectAnswerEntity, (ca) => ca.question, {
    cascade: true,
  })
  correctAnswers!: CorrectAnswerEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
