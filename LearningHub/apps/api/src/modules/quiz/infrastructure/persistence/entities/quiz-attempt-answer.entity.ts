import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuizAttemptEntity } from './quiz-attempt.entity';
import { QuestionEntity } from './question.entity';
import { AnswerOptionEntity } from './answer-option.entity';

@Entity('quiz_attempt_answers')
export class QuizAttemptAnswerEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'attempt_id' }) attemptId!: string;
  @ManyToOne(() => QuizAttemptEntity, (a) => a.answers)
  @JoinColumn({ name: 'attempt_id' })
  attempt!: QuizAttemptEntity;
  @Column({ name: 'question_id' }) questionId!: string;
  @ManyToOne(() => QuestionEntity)
  @JoinColumn({ name: 'question_id' })
  question!: QuestionEntity;
  @Column({ name: 'selected_option_id', type: 'varchar', nullable: true })
  selectedOptionId!: string | null;
  @ManyToOne(() => AnswerOptionEntity, { nullable: true })
  @JoinColumn({ name: 'selected_option_id' })
  selectedOption!: AnswerOptionEntity | null;
  @Column({ name: 'is_correct', default: false }) isCorrect!: boolean;
  @Column({ name: 'time_spent_seconds', type: 'int', nullable: true })
  timeSpentSeconds!: number | null;
  @Column({ name: 'question_order' }) questionOrder!: number;
}
