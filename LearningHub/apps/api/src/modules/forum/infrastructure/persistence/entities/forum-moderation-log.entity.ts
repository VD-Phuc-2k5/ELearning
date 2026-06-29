import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../../../auth/infrastructure/persistence/entities/user.entity';
import { ForumEntity } from './forum.entity';

@Entity('forum_moderation_logs')
export class ForumModerationLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'moderator_id', type: 'varchar' })
  moderatorId!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'moderator_id' })
  moderator!: UserEntity;

  @Column()
  action!: string;

  @Column({ name: 'target_type', type: 'varchar', nullable: true })
  targetType!: string | null;

  @Column({ name: 'target_id', nullable: true, type: 'uuid' })
  targetId!: string | null;

  @Column({ name: 'reason_code', type: 'varchar', nullable: true })
  reasonCode!: string | null;

  @Column({ name: 'reason_text', nullable: true, type: 'text' })
  reasonText!: string | null;

  @Column({ name: 'forum_id', type: 'varchar', nullable: true })
  forumId!: string | null;

  @ManyToOne(() => ForumEntity, { nullable: true })
  @JoinColumn({ name: 'forum_id' })
  forum!: ForumEntity | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
