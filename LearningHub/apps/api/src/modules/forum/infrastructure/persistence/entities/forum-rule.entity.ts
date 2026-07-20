import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ForumEntity } from './forum.entity';

@Entity('forum_rules')
export class ForumRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'forum_id' })
  forumId!: string;

  @ManyToOne(() => ForumEntity)
  @JoinColumn({ name: 'forum_id' })
  forum!: ForumEntity;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ default: 0 })
  order!: number;
}
