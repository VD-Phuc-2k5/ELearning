import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('refresh_tokens')
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  tokenHash!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt!: Date | null;
}
