import { UserPermission } from "../entities/user-permission.entity";

export interface IUserPermissionRepository {
    findByUserId(userId: string): Promise<UserPermission[]>;
    upsert(
        userId: string,
        permissionId: number,
        isGranted: boolean,
        grantedBy: string
    ): Promise<UserPermission>;
    remove(userId: string, permissionId: number): Promise<void>;
}