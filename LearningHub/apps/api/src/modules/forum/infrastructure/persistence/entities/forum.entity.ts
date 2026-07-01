import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../../../auth/infrastructure/persistence/entities/user.entity';

@Entity('forums')
export class ForumEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ nullable: true, type: 'text' })
  description!: string | null;

  @Column({ default: 'public' })
  visibility!: string;

  @Column({ name: 'banner_url', type: 'varchar', length: 255, nullable: true })
  bannerUrl!: string | null;

  @Column({ name: 'icon_url', type: 'varchar', length: 255, nullable: true })
  iconUrl!: string | null;

  @Column({ name: 'member_count', default: 0 })
  memberCount!: number;

  @Column({ name: 'post_count', default: 0 })
  postCount!: number;

  @Column({ name: 'owner_id' })
  ownerId!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'owner_id' })
  owner!: UserEntity;

  @Column({ name: 'is_locked', default: false })
  isLocked!: boolean;

  @Column({ name: 'search_vector', type: 'tsvector', nullable: true })
  @Index({ type: 'gin' })
  searchVector!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
