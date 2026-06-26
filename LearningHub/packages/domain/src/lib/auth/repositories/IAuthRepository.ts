import { Either, Failure } from '@learning-hub/core';
import { User, Role, Permission } from '../entities/entities';

export interface IAuthRepository {
    // Auth
    register(data: any): Promise<Either<Failure, User>>;
    login(data: any): Promise<Either<Failure, { accessToken: string; refreshToken: string }>>;
    adminLogin(data: any): Promise<Either<Failure, { accessToken: string; refreshToken: string }>>;
    refreshToken(token: string): Promise<Either<Failure, { accessToken: string; refreshToken: string }>>;
    logout(): Promise<Either<Failure, void>>;
    getProfile(): Promise<Either<Failure, User>>;

    // Admin Users
    getUsers(): Promise<Either<Failure, User[]>>;
    registerAdmin(data: any): Promise<Either<Failure, User>>;

    // Roles
    getRoles(): Promise<Either<Failure, Role[]>>;
    createRole(data: any): Promise<Either<Failure, Role>>;
    updateRole(id: number, data: any): Promise<Either<Failure, Role>>;
    deleteRole(id: number): Promise<Either<Failure, void>>;
    getRolePermissions(roleId: number): Promise<Either<Failure, number[]>>;
    assignPermissionToRole(roleId: number, permissionId: number): Promise<Either<Failure, void>>;
    removePermissionFromRole(roleId: number, permissionId: number): Promise<Either<Failure, void>>;

    // Permissions
    getPermissions(): Promise<Either<Failure, Permission[]>>;
    getResources(): Promise<Either<Failure, string[]>>;
    createPermission(data: any): Promise<Either<Failure, Permission>>;
    deletePermission(id: number): Promise<Either<Failure, void>>;

    // User-Roles
    getUserRoles(userId: string): Promise<Either<Failure, Role[]>>;
    assignRoleToUser(userId: string, roleId: number): Promise<Either<Failure, void>>;
    removeRoleFromUser(userId: string, roleId: number): Promise<Either<Failure, void>>;

    // User-Permissions
    getUserPermissions(userId: string): Promise<Either<Failure, any[]>>;
    grantUserPermission(userId: string, data: any): Promise<Either<Failure, void>>;
    revokeUserPermission(userId: string, permissionId: number): Promise<Either<Failure, void>>;
}
