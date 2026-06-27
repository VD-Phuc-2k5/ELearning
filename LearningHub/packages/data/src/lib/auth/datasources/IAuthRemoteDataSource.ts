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
} from '@learning-hub/domain';

export interface IAuthRemoteDataSource {
  register(data: RegisterParams): Promise<{ user: User }>;
  login(data: LoginParams): Promise<AuthTokens>;
  adminLogin(data: LoginParams): Promise<AuthTokens>;
  refreshToken(data: { refreshToken: string }): Promise<AuthTokens>;
  logout(token?: string): Promise<void>;
  getProfile(token?: string): Promise<User>;
  getUsers(token?: string): Promise<User[]>;
  registerAdmin(data: RegisterParams, token?: string): Promise<{ user: User }>;
  getRoles(token?: string): Promise<Role[]>;
  createRole(data: CreateRoleParams, token?: string): Promise<Role>;
  updateRole(id: number, data: UpdateRoleParams, token?: string): Promise<Role>;
  deleteRole(id: number, token?: string): Promise<void>;
  getPermissions(token?: string): Promise<Permission[]>;
  getResources(token?: string): Promise<{ resources: string[] }>;
  createPermission(
    data: CreatePermissionParams,
    token?: string,
  ): Promise<Permission>;
  deletePermission(id: number, token?: string): Promise<void>;
  getRolePermissions(
    roleId: number,
    token?: string,
  ): Promise<Array<{ permissionId: number }>>;
  assignPermission(
    roleId: number,
    permissionId: number,
    token?: string,
  ): Promise<void>;
  removePermission(
    roleId: number,
    permissionId: number,
    token?: string,
  ): Promise<void>;
  getUserRoles(userId: string, token?: string): Promise<Role[]>;
  assignRoleToUser(
    userId: string,
    roleId: number,
    token?: string,
  ): Promise<void>;
  removeRoleFromUser(
    userId: string,
    roleId: number,
    token?: string,
  ): Promise<void>;
  getUserPermissions(userId: string, token?: string): Promise<Permission[]>;
  grantUserPermission(
    userId: string,
    data: GrantPermissionParams,
    token?: string,
  ): Promise<void>;
  revokeUserPermission(
    userId: string,
    permissionId: number,
    token?: string,
  ): Promise<void>;
}
