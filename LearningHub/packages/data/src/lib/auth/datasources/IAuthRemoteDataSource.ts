import {
  AuthTokens,
  CreatePermissionParams,
  CreateRoleParams,
  GrantPermissionParams,
  LoginParams,
  Permission,
  RegisterParams,
  Role,
  UpdateAdminParams,
  UpdateRoleParams,
  User,
} from '@learning-hub/domain';

export interface IAuthRemoteDataSource {
  setToken(token: string): void;
  register(data: RegisterParams): Promise<{ user: User }>;
  login(data: LoginParams): Promise<AuthTokens>;
  adminLogin(data: LoginParams): Promise<AuthTokens>;
  refreshToken(data: { token: string }): Promise<AuthTokens>;
  logout(refreshToken: string): Promise<void>;
  getProfile(): Promise<User>;
  getUsers(role?: string): Promise<User[]>;
  registerAdmin(data: RegisterParams): Promise<{ user: User }>;
  updateUser(id: string, data: UpdateAdminParams): Promise<User>;
  deleteUser(id: string): Promise<void>;
  searchUsersByEmail(email: string): Promise<User[]>;
  getRoles(): Promise<Role[]>;
  createRole(data: CreateRoleParams): Promise<Role>;
  updateRole(id: number, data: UpdateRoleParams): Promise<Role>;
  deleteRole(id: number): Promise<void>;
  getPermissions(): Promise<Permission[]>;
  getResources(): Promise<{ resources: string[] }>;
  createPermission(data: CreatePermissionParams): Promise<Permission>;
  deletePermission(id: number): Promise<void>;
  getRolePermissions(roleId: number): Promise<Permission[]>;
  assignPermission(roleId: number, permissionId: number): Promise<void>;
  removePermission(roleId: number, permissionId: number): Promise<void>;
  getUserRoles(userId: string): Promise<Role[]>;
  assignRoleToUser(userId: string, roleId: number): Promise<void>;
  removeRoleFromUser(userId: string, roleId: number): Promise<void>;
  getUserPermissions(userId: string): Promise<Permission[]>;
  grantUserPermission(
    userId: string,
    data: GrantPermissionParams,
  ): Promise<void>;
  revokeUserPermission(userId: string, permissionId: number): Promise<void>;
}
