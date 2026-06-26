import { Either, Failure } from '@learning-hub/core';
import {
  AuthTokens,
  CreatePermissionParams,
  CreateRoleParams,
  GrantPermissionParams,
  LoginParams,
  Permission,
  RegisterParams,
  Role,
  UpdateRoleParams,
  User,
} from '../entities/entities';

export interface IAuthRepository {
  // Auth
  register(data: RegisterParams): Promise<Either<Failure, User>>;
  login(data: LoginParams): Promise<Either<Failure, AuthTokens>>;
  adminLogin(data: LoginParams): Promise<Either<Failure, AuthTokens>>;
  refreshToken(token: string): Promise<Either<Failure, AuthTokens>>;
  logout(): Promise<Either<Failure, void>>;
  getProfile(): Promise<Either<Failure, User>>;

  // Admin Users
  getUsers(): Promise<Either<Failure, User[]>>;
  registerAdmin(data: RegisterParams): Promise<Either<Failure, User>>;

  // Roles
  getRoles(): Promise<Either<Failure, Role[]>>;
  createRole(data: CreateRoleParams): Promise<Either<Failure, Role>>;
  updateRole(
    id: number,
    data: UpdateRoleParams,
  ): Promise<Either<Failure, Role>>;
  deleteRole(id: number): Promise<Either<Failure, void>>;
  getRolePermissions(roleId: number): Promise<Either<Failure, number[]>>;
  assignPermissionToRole(
    roleId: number,
    permissionId: number,
  ): Promise<Either<Failure, void>>;
  removePermissionFromRole(
    roleId: number,
    permissionId: number,
  ): Promise<Either<Failure, void>>;

  // Permissions
  getPermissions(): Promise<Either<Failure, Permission[]>>;
  getResources(): Promise<Either<Failure, string[]>>;
  createPermission(
    data: CreatePermissionParams,
  ): Promise<Either<Failure, Permission>>;
  deletePermission(id: number): Promise<Either<Failure, void>>;

  // User-Roles
  getUserRoles(userId: string): Promise<Either<Failure, Role[]>>;
  assignRoleToUser(
    userId: string,
    roleId: number,
  ): Promise<Either<Failure, void>>;
  removeRoleFromUser(
    userId: string,
    roleId: number,
  ): Promise<Either<Failure, void>>;

  // User-Permissions
  getUserPermissions(userId: string): Promise<Either<Failure, Permission[]>>;
  grantUserPermission(
    userId: string,
    data: GrantPermissionParams,
  ): Promise<Either<Failure, void>>;
  revokeUserPermission(
    userId: string,
    permissionId: number,
  ): Promise<Either<Failure, void>>;
}
