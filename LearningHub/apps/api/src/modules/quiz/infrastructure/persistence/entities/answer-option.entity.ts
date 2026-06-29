import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuestionEntity } from './question.entity';

@Entity('answer_options')
export class AnswerOptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'question_id' })
  questionId!: string;

  @ManyToOne(() => QuestionEntity, (question) => question.answerOptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id' })
  question!: QuestionEntity;

  @Column({ name: 'option_label', length: 1 })
  optionLabel!: string; // 'A', 'B', 'C', 'D'

  @Column({ type: 'text' })
  content!: string;
}
