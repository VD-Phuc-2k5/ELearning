import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { UserEntity } from '../../../../auth/infrastructure/persistence/entities/user.entity';
import { ForumPostEntity } from './forum-post.entity';

@Entity('forum_bookmarks')
export class ForumBookmarkEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @PrimaryColumn({ name: 'post_id', type: 'uuid' })
  postId!: string;

  @ManyToOne(() => ForumPostEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post!: ForumPostEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
