import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SubmissionEntity } from './submission.entity';
import { TestCaseEntity } from './test-case.entity';

@Entity('submission_results')
export class SubmissionResultEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'submission_id' })
  submissionId!: string;

  @ManyToOne(() => SubmissionEntity, (sub) => sub.results, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'submission_id' })
  submission!: SubmissionEntity;

  @Column({ name: 'test_case_id' })
  testCaseId!: string;

  @ManyToOne(() => TestCaseEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'test_case_id' })
  testCase!: TestCaseEntity;

  @Column({
    type: 'varchar',
    length: 30,
  })
  status!:
    | 'accepted'
    | 'wrong_answer'
    | 'time_limit_exceeded'
    | 'runtime_error'
    | 'memory_limit_exceeded';

  @Column({ name: 'actual_output', type: 'text', nullable: true })
  actualOutput!: string | null;

  @Column({ name: 'execution_time_ms', type: 'integer', nullable: true })
  executionTimeMs!: number | null;

  @Column({ name: 'memory_used_kb', type: 'integer', nullable: true })
  memoryUsedKb!: number | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
