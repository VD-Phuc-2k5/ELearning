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
import { UserEntity } from '../../../../auth/infrastructure/persistence/entities/user.entity';
import { TestCaseEntity } from './test-case.entity';
import { SubmissionEntity } from './submission.entity';

@Entity('coding_problems')
export class CodingProblemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 20 })
  difficulty!: 'easy' | 'medium' | 'hard';

  @Column({ name: 'time_limit_ms', type: 'integer', default: 5000 })
  timeLimitMs!: number;

  @Column({ name: 'memory_limit_mb', type: 'integer', default: 256 })
  memoryLimitMb!: number;

  @Column({ name: 'sample_input', type: 'text', nullable: true })
  sampleInput!: string | null;

  @Column({ name: 'sample_output', type: 'text', nullable: true })
  sampleOutput!: string | null;

  @Column({ name: 'languages', type: 'jsonb' })
  languages!: string[];

  @Column({ name: 'templates', type: 'jsonb', default: {} })
  templates!: Record<string, string>;

  @Column({ name: 'wrappers', type: 'jsonb', default: {} })
  wrappers!: Record<string, string>;

  @Column({ name: 'creator_id' })
  creatorId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'creator_id' })
  creator!: UserEntity | null;

  @OneToMany(() => TestCaseEntity, (tc) => tc.problem, { cascade: true })
  testCases!: TestCaseEntity[];

  @OneToMany(() => SubmissionEntity, (sub) => sub.problem)
  submissions!: SubmissionEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
