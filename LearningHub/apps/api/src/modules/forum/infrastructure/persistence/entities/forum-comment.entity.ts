import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ForumPostEntity } from './forum-post.entity';
import { UserEntity } from '../../../../auth/infrastructure/persistence/entities/user.entity';

@Entity('forum_comments')
export class ForumCommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'post_id' })
  postId!: string;

  @ManyToOne(() => ForumPostEntity)
  @JoinColumn({ name: 'post_id' })
  post!: ForumPostEntity;

  @Column({ name: 'author_id' })
  authorId!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'author_id' })
  author!: UserEntity;

  @Column({ name: 'parent_id', nullable: true })
  parentId!: string | null;

  @ManyToOne(() => ForumCommentEntity, (c) => c.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent!: ForumCommentEntity | null;

  @OneToMany('ForumCommentEntity', 'parent')
  replies!: ForumCommentEntity[];

  @Column({ type: 'smallint', default: 0 })
  depth!: number;

  @Column({ type: 'text' })
  content!: string;

  @Column({ default: 'published' })
  status!: string;

  @Column({ name: 'reply_count', default: 0 })
  replyCount!: number;

  @Column({ name: 'reaction_count', default: 0 })
  reactionCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt!: Date | null;
}
