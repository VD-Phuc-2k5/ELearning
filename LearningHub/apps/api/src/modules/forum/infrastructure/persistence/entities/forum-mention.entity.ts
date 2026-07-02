import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../../../auth/infrastructure/persistence/entities/user.entity';
import { ForumPostEntity } from './forum-post.entity';

@Entity('forum_mentions')
export class ForumMentionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'post_id', type: 'varchar', nullable: true })
  postId!: string | null;

  @ManyToOne(() => ForumPostEntity, { nullable: true })
  @JoinColumn({ name: 'post_id' })
  post!: ForumPostEntity | null;

  @Column({ name: 'comment_id', type: 'varchar', nullable: true })
  commentId!: string | null;

  @Column({ name: 'mentioned_user_id', type: 'varchar' })
  mentionedUserId!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'mentioned_user_id' })
  mentionedUser!: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
