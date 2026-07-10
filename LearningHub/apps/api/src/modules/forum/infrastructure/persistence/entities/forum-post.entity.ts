import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ForumEntity } from './forum.entity';
import { ForumTagEntity } from './forum-tag.entity';
import { UserEntity } from '../../../../auth/infrastructure/persistence/entities/user.entity';
import { QuestionBankEntity } from '../../../../quiz/infrastructure/persistence/entities/question-bank.entity';

@Entity('forum_posts')
export class ForumPostEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'forum_id' })
  forumId!: string;

  @ManyToOne(() => ForumEntity)
  @JoinColumn({ name: 'forum_id' })
  forum!: ForumEntity;

  @Column({ name: 'author_id' })
  authorId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author!: UserEntity;

  @Column()
  title!: string;

  @Column({ type: 'jsonb', nullable: true })
  content!: Record<string, unknown> | null;

  @Column({ name: 'post_type', default: 'text' })
  postType!: string;

  @Column({ default: 'published' })
  status!: string;

  @Column({ name: 'is_pinned', default: false })
  isPinned!: boolean;

  @Column({ name: 'is_locked', default: false })
  isLocked!: boolean;

  @Column({ name: 'comment_count', default: 0 })
  commentCount!: number;

  @Column({ name: 'reaction_count', default: 0 })
  reactionCount!: number;

  @Column({ name: 'view_count', default: 0 })
  viewCount!: number;

  @Column({ name: 'roadmap_id', type: 'varchar', nullable: true })
  roadmapId!: string | null;

  @Column({ name: 'question_bank_id', type: 'uuid', nullable: true })
  questionBankId!: string | null;

  @ManyToOne(() => QuestionBankEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_bank_id' })
  questionBank!: QuestionBankEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt!: Date | null;

  @ManyToMany(() => ForumTagEntity, { eager: false, cascade: false })
  @JoinTable({
    name: 'forum_post_tags',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags!: ForumTagEntity[];
}
