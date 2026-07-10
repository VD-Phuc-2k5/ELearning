import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../../../auth/infrastructure/persistence/entities/user.entity';
import { RoadmapEntity } from './roadmap.entity';
import { QuestionBankEntity } from '../../../../quiz/infrastructure/persistence/entities/question-bank.entity';

@Entity('user_roadmap_progress')
export class UserRoadmapProgressEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'roadmap_id' })
  roadmapId!: string;

  @ManyToOne(() => RoadmapEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roadmap_id' })
  roadmap!: RoadmapEntity;

  @Column({ name: 'total_banks', default: 0 })
  totalBanks!: number;

  @Column({ name: 'completed_banks', default: 0 })
  completedBanks!: number;

  @Column({
    name: 'progress_percent',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  progressPercent!: number;

  @Column({ default: 'not_started' })
  status!: string;

  @Column({ name: 'current_bank_id', type: 'varchar', nullable: true })
  currentBankId!: string | null;

  @ManyToOne(() => QuestionBankEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'current_bank_id' })
  currentBank!: QuestionBankEntity | null;

  @Column({ name: 'last_accessed_bank_id', type: 'varchar', nullable: true })
  lastAccessedBankId!: string | null;

  @ManyToOne(() => QuestionBankEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'last_accessed_bank_id' })
  lastAccessedBank!: QuestionBankEntity | null;

  @Column({ name: 'started_at', nullable: true, type: 'timestamp' })
  startedAt!: Date | null;

  @Column({ name: 'last_accessed_at', nullable: true, type: 'timestamp' })
  lastAccessedAt!: Date | null;

  @Column({ name: 'completed_at', nullable: true, type: 'timestamp' })
  completedAt!: Date | null;
}
