import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('forum_reactions')
@Index('UQ_forum_reactions_target_user', ['targetType', 'targetId', 'userId'], {
  unique: true,
})
export class ForumReactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'target_type' })
  targetType!: string;

  @Column({ name: 'target_id', type: 'uuid' })
  targetId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column()
  emoji!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
