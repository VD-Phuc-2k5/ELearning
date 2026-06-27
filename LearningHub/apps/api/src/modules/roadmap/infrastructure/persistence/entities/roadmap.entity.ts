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

@Entity('roadmaps')
export class RoadmapEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true, type: 'text' })
  description!: string | null;

  @Column({ name: 'creator_id' })
  creatorId!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'creator_id' })
  creator!: UserEntity;

  @Column({ default: 'draft' })
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
