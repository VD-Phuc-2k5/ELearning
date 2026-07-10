import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { UserEntity } from '../../../../auth/infrastructure/persistence/entities/user.entity';
import { ForumEntity } from './forum.entity';

@Entity('forum_follows')
export class ForumFollowEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @PrimaryColumn({ name: 'forum_id', type: 'uuid' })
  forumId!: string;

  @ManyToOne(() => ForumEntity)
  @JoinColumn({ name: 'forum_id' })
  forum!: ForumEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
