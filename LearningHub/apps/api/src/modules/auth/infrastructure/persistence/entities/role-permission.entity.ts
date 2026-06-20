import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoleEntity } from './role.entity';
import { PermissionEntity } from './permission.entity';

@Entity('role_permissions')
export class RolePermissionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'role_id', nullable: true })
  roleId!: number;

  @ManyToOne(() => RoleEntity, (r) => r.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role!: RoleEntity;

  @Column({ name: 'permission_id', nullable: true })
  permissionId!: number;

  @ManyToOne(() => PermissionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission!: PermissionEntity;

  @CreateDateColumn()
  createdAt!: Date;
}
