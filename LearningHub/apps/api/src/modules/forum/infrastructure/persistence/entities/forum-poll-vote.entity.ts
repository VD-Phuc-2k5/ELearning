import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ForumPollEntity } from './forum-poll.entity';
import { ForumPollOptionEntity } from './forum-poll-option.entity';
import { UserEntity } from '../../../../auth/infrastructure/persistence/entities/user.entity';

@Entity('forum_poll_votes')
export class ForumPollVoteEntity {
  @PrimaryColumn({ name: 'poll_id', type: 'uuid' })
  pollId!: string;

  @ManyToOne(() => ForumPollEntity)
  @JoinColumn({ name: 'poll_id' })
  poll!: ForumPollEntity;

  @PrimaryColumn({ name: 'option_id', type: 'uuid' })
  optionId!: string;

  @ManyToOne(() => ForumPollOptionEntity)
  @JoinColumn({ name: 'option_id' })
  option!: ForumPollOptionEntity;

  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;
}
