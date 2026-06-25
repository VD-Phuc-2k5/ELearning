import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { RolePermissionEntity } from "./role-permission.entity";
import { UserRoleEntity } from "./user-role.entity";

@Entity('roles')
export class RoleEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    code!: string;

    @Column()
    name!: string;

    @Column({ nullable: true })
    description!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => RolePermissionEntity, rp => rp.role)
    rolePermissions!: RolePermissionEntity[];

    @OneToMany(() => UserRoleEntity, ur => ur.role)
    userRoles!: UserRoleEntity[];
}