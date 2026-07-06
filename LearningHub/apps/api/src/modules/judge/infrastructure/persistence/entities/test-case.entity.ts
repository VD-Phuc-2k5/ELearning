import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CodingProblemEntity } from './coding-problem.entity';

@Entity('test_cases')
export class TestCaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'problem_id' })
  problemId!: string;

  @ManyToOne(() => CodingProblemEntity, (p) => p.testCases, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'problem_id' })
  problem!: CodingProblemEntity;

  @Column({ type: 'text' })
  input!: string;

  @Column({ name: 'expected_output', type: 'text' })
  expectedOutput!: string;

  @Column({ name: 'is_hidden', type: 'boolean', default: true })
  isHidden!: boolean;

  @Column({ name: 'order_index', type: 'integer', default: 0 })
  orderIndex!: number;

  @Column({ type: 'integer', default: 1 })
  points!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
