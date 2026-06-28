import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../../../auth/infrastructure/persistence/entities/user.entity';
import { QuestionBankEntity } from './question-bank.entity';
import { QuizAttemptAnswerEntity } from './quiz-attempt-answer.entity';

@Entity('quiz_attempts')
export class QuizAttemptEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'user_id' }) userId!: string;
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;
  @Column({ name: 'question_bank_id' }) questionBankId!: string;
  @ManyToOne(() => QuestionBankEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_bank_id' })
  questionBank!: QuestionBankEntity;
  @Column({ name: 'started_at', type: 'timestamp' }) startedAt!: Date;
  @Column({ name: 'finished_at', nullable: true, type: 'timestamp' })
  finishedAt!: Date | null;
  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds!: number | null;
  @Column({
    name: 'score_percent',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  scorePercent!: number | null;
  @Column({ name: 'correct_count', default: 0 }) correctCount!: number;
  @Column({ name: 'wrong_count', default: 0 }) wrongCount!: number;
  @Column({ name: 'total_questions', default: 0 }) totalQuestions!: number;
  @Column({ default: 'in_progress' }) status!: string;
  @OneToMany(() => QuizAttemptAnswerEntity, (a) => a.attempt, { cascade: true })
  answers!: QuizAttemptAnswerEntity[];
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}
