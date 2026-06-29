import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ForumPollEntity } from './forum-poll.entity';

@Entity('forum_poll_options')
export class ForumPollOptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'poll_id' })
  pollId!: string;

  @ManyToOne(() => ForumPollEntity)
  @JoinColumn({ name: 'poll_id' })
  poll!: ForumPollEntity;

  @Column()
  text!: string;

  @Column({ name: 'vote_count', default: 0 })
  voteCount!: number;

  @Column({ name: 'display_order', default: 0 })
  displayOrder!: number;
}
