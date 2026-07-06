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
import { CodingProblemEntity } from './coding-problem.entity';
import { SubmissionResultEntity } from './submission-result.entity';

@Entity('code_submissions')
export class SubmissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'problem_id' })
  problemId!: string;

  @ManyToOne(() => CodingProblemEntity, (p) => p.submissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'problem_id' })
  problem!: CodingProblemEntity;

  @Column({ type: 'varchar', length: 50 })
  language!: string;

  @Column({ name: 'source_code', type: 'text' })
  sourceCode!: string;

  @Column({
    type: 'varchar',
    length: 30,
    default: 'queued',
  })
  status!:
    | 'queued'
    | 'running'
    | 'accepted'
    | 'wrong_answer'
    | 'time_limit_exceeded'
    | 'compilation_error'
    | 'runtime_error'
    | 'memory_limit_exceeded';

  @Column({ type: 'integer', default: 0 })
  score!: number;

  @Column({ name: 'total_test_cases', type: 'integer', default: 0 })
  totalTestCases!: number;

  @Column({ name: 'passed_test_cases', type: 'integer', default: 0 })
  passedTestCases!: number;

  @Column({ name: 'execution_time_ms', type: 'integer', nullable: true })
  executionTimeMs!: number | null;

  @Column({ name: 'memory_used_kb', type: 'integer', nullable: true })
  memoryUsedKb!: number | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;

  @OneToMany(() => SubmissionResultEntity, (res) => res.submission, {
    cascade: true,
  })
  results!: SubmissionResultEntity[];

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt!: Date;

  @Column({ name: 'judged_at', type: 'timestamp', nullable: true })
  judgedAt!: Date | null;
}
