import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../../../auth/infrastructure/persistence/entities/user.entity';

@Entity('code_executions')
export class CodeExecutionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'language', length: 20 })
  language!: string;

  @Column({ name: 'source_code', type: 'text' })
  sourceCode!: string;

  @Column({ name: 'stdin', type: 'text', nullable: true })
  stdin!: string | null;

  @Column({ name: 'stdout', type: 'text', nullable: true })
  stdout!: string | null;

  @Column({ name: 'stderr', type: 'text', nullable: true })
  stderr!: string | null;

  @Column({ name: 'exit_code', type: 'integer', nullable: true })
  exitCode!: number | null;

  @Column({ name: 'status', length: 20 })
  status!: 'success' | 'error' | 'timeout' | 'memory_limit';

  @Column({ name: 'execution_time_ms', type: 'integer', nullable: true })
  executionTimeMs!: number | null;

  @Column({ name: 'memory_used_bytes', type: 'bigint', nullable: true })
  memoryUsedBytes!: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
