import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ForumEntity } from './forum.entity';
import { UserEntity } from '../../../../auth/infrastructure/persistence/entities/user.entity';

@Entity('forum_invites')
export class ForumInviteEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'forum_id', type: 'varchar' })
  forumId!: string;

  @ManyToOne(() => ForumEntity)
  @JoinColumn({ name: 'forum_id' })
  forum!: ForumEntity;

  @Column({ name: 'inviter_id', type: 'varchar' })
  inviterId!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'inviter_id' })
  inviter!: UserEntity;

  @Column({ name: 'invitee_id', nullable: true, type: 'varchar' })
  inviteeId!: string | null;

  @Column({ unique: true })
  token!: string;

  @Column({ default: 'pending' })
  status!: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;

  @Column({ name: 'accepted_count', default: 0 })
  acceptedCount!: number;
}
