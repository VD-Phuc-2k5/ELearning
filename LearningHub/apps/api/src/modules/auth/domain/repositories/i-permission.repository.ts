import { Permission } from "../entities/permission.entity";

export interface IPermissionRepository {
    findById(id: number): Promise<Permission | null>;
    findByCode(code: string): Promise<Permission | null>;
    findAll(): Promise<Permission[]>;
    create(permission: Permission): Promise<Permission>;
    update(permission: Permission): Promise<Permission>;
    delete(id: number): Promise<void>;
}