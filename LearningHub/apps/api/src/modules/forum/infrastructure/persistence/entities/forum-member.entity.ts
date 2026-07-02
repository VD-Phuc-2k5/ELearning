import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ForumEntity } from './forum.entity';
import { UserEntity } from '../../../../auth/infrastructure/persistence/entities/user.entity';

@Entity('forum_members')
@Index('UQ_forum_members_forum_user', ['forumId', 'userId'], { unique: true })
export class ForumMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'forum_id' })
  forumId!: string;

  @ManyToOne(() => ForumEntity)
  @JoinColumn({ name: 'forum_id' })
  forum!: ForumEntity;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ default: 'member' })
  role!: string;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt!: Date;
}
