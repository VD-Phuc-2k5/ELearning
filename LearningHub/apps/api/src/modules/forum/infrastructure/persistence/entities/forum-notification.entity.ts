import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../../../auth/infrastructure/persistence/entities/user.entity';

@Entity('forum_notifications')
export class ForumNotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'recipient_id', type: 'varchar' })
  recipientId!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'recipient_id' })
  recipient!: UserEntity;

  @Column({ name: 'actor_id', nullable: true, type: 'varchar' })
  actorId!: string | null;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'actor_id' })
  actor!: UserEntity | null;

  @Column()
  type!: string;

  @Column({ name: 'target_type', nullable: true, type: 'varchar' })
  targetType!: string | null;

  @Column({ name: 'target_id', nullable: true, type: 'uuid' })
  targetId!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @Column({ name: 'is_read', default: false })
  isRead!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
