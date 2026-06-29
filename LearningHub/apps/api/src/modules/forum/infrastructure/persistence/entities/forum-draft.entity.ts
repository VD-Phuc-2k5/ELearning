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
import { ForumEntity } from './forum.entity';

@Entity('forum_drafts')
export class ForumDraftEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'author_id' })
  authorId!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'author_id' })
  author!: UserEntity;

  @Column({ name: 'forum_id', type: 'varchar', nullable: true })
  forumId!: string | null;

  @ManyToOne(() => ForumEntity, { nullable: true })
  @JoinColumn({ name: 'forum_id' })
  forum!: ForumEntity | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  content!: Record<string, unknown> | null;

  @Column({ name: 'post_type', default: 'text' })
  postType!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
