import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../../../auth/infrastructure/persistence/entities/user.entity';
import { QuestionBankEntity } from './question-bank.entity';

@Entity('user_bank_progress')
export class UserBankProgressEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'user_id' }) userId!: string;
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;
  @Column({ name: 'question_bank_id' }) questionBankId!: string;
  @ManyToOne(() => QuestionBankEntity)
  @JoinColumn({ name: 'question_bank_id' })
  questionBank!: QuestionBankEntity;
  @Column({ name: 'attempt_count', default: 0 }) attemptCount!: number;
  @Column({
    name: 'best_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  bestScore!: number | null;
  @Column({
    name: 'latest_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  latestScore!: number | null;
  @Column({ name: 'is_completed', default: false }) isCompleted!: boolean;
  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt!: Date | null;
  @Column({ name: 'first_attempt_at', type: 'timestamp', nullable: true })
  firstAttemptAt!: Date | null;
  @Column({ name: 'last_accessed_at', type: 'timestamp', nullable: true })
  lastAccessedAt!: Date | null;
}
