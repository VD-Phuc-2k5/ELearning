import { Permission } from "../entities/permission.entity";

export interface IRolePermissionRepository {
    findPermissionsByRoleId(roleId: number): Promise<Permission[]>;
    findPermissionCodesByRoleIds(roleIds: number[]): Promise<string[]>;
    assign(roleId: number, permissionId: number): Promise<void>;
    remove(roleId: number, permissionId: number): Promise<void>;
    exists(roleId: number, permissionId: number): Promise<boolean>;
}