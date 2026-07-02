import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ForumPostEntity } from './forum-post.entity';

@Entity('forum_polls')
export class ForumPollEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'post_id', unique: true })
  postId!: string;

  @OneToOne(() => ForumPostEntity)
  @JoinColumn({ name: 'post_id' })
  post!: ForumPostEntity;

  @Column()
  question!: string;

  @Column({ name: 'ends_at', type: 'timestamp', nullable: true })
  endsAt!: Date | null;

  @Column({ name: 'is_multiple_choice', default: false })
  isMultipleChoice!: boolean;
}
