import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  code!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column()
  resource!: string;

  @Column()
  action!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
