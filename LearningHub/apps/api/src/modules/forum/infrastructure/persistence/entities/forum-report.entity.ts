import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../../../auth/infrastructure/persistence/entities/user.entity';

@Entity('forum_reports')
export class ForumReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'reporter_id' })
  reporterId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporter_id' })
  reporter!: UserEntity;

  @Column({ name: 'target_type' })
  targetType!: string;

  @Column({ name: 'target_id', type: 'uuid' })
  targetId!: string;

  @Column()
  reason!: string;

  @Column({ nullable: true, type: 'text' })
  description!: string | null;

  @Column({ default: 'pending' })
  status!: string;

  @Column({ name: 'resolved_by', nullable: true })
  resolvedBy!: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'resolved_by' })
  resolver!: UserEntity | null;

  @Column({ name: 'resolution_note', nullable: true, type: 'text' })
  resolutionNote!: string | null;

  @Column({ name: 'resolved_at', nullable: true, type: 'timestamp' })
  resolvedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
