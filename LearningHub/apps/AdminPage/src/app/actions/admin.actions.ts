'use server';

import { withTokenRefresh } from '@learning-hub/core';
import {
  AuthRemoteDataSourceImpl,
  AuthRepositoryImpl,
} from '@learning-hub/data';
import { createTokenStore } from '@learning-hub/data/server';
import type {
  CreatePermissionParams,
  CreateRoleParams,
  Permission,
  RegisterParams,
  Role,
  UpdateAdminParams,
  UpdateRoleParams,
  User,
} from '@learning-hub/domain';
import {
  AdminRegisterUsecase,
  AssignPermissionToRoleUsecase,
  AssignRoleToUserUsecase,
  CreatePermissionUsecase,
  CreateRoleUsecase,
  DeleteAdminUsecase,
  DeletePermissionUsecase,
  DeleteRoleUsecase,
  GetPermissionsUsecase,
  GetResourcesUsecase,
  GetRolePermissionsUsecase,
  GetRolesUsecase,
  GetUserPermissionsUsecase,
  GetUserRolesUsecase,
  GetUsersUsecase,
  GrantUserPermissionUsecase,
  RemovePermissionFromRoleUsecase,
  RemoveRoleFromUserUsecase,
  RevokeUserPermissionUsecase,
  SearchUsersUsecase,
  UpdateAdminUsecase,
  UpdateRoleUsecase,
} from '@learning-hub/domain';

export interface RolePermissionMatrix {
  roles: Role[];
  permissions: Permission[];
  matrix: Record<number, number[]>;
}

const tokenStore = createTokenStore();

async function executeWithRefresh<T>(
  fn: (
    repo: AuthRepositoryImpl,
  ) => Promise<
    import('@learning-hub/core').Either<import('@learning-hub/core').Failure, T>
  >,
): Promise<T> {
  return withTokenRefresh(
    tokenStore,
    async (refreshToken) => {
      const refreshDs = new AuthRemoteDataSourceImpl();
      return refreshDs.refreshToken({ token: refreshToken });
    },
    (token) =>
      fn(new AuthRepositoryImpl(new AuthRemoteDataSourceImpl(), token)),
  );
}

export async function getUsers(role?: string): Promise<User[]> {
  return executeWithRefresh((repo) =>
    new GetUsersUsecase(repo).execute({ role }),
  );
}

export async function registerAdmin(data: RegisterParams): Promise<User> {
  return executeWithRefresh((repo) =>
    new AdminRegisterUsecase(repo).execute(data),
  );
}

export async function updateAdmin(
  id: string,
  data: UpdateAdminParams,
): Promise<User> {
  return executeWithRefresh((repo) =>
    new UpdateAdminUsecase(repo).execute({ id, ...data }),
  );
}

export async function deleteAdmin(id: string): Promise<void> {
  return executeWithRefresh((repo) =>
    new DeleteAdminUsecase(repo).execute({ id }),
  );
}

export async function searchUsers(email: string): Promise<User[]> {
  return executeWithRefresh((repo) =>
    new SearchUsersUsecase(repo).execute({ email }),
  );
}

export async function toggleUserLock(
  id: string,
  isActive: boolean,
): Promise<User> {
  return executeWithRefresh((repo) =>
    new UpdateAdminUsecase(repo).execute({ id, isActive }),
  );
}

export async function getRoles(): Promise<Role[]> {
  return executeWithRefresh((repo) => new GetRolesUsecase(repo).execute({}));
}

export async function createRole(data: CreateRoleParams): Promise<Role> {
  return executeWithRefresh((repo) =>
    new CreateRoleUsecase(repo).execute(data),
  );
}

export async function updateRole(
  id: number,
  data: UpdateRoleParams,
): Promise<Role> {
  return executeWithRefresh((repo) =>
    new UpdateRoleUsecase(repo).execute({ id, data }),
  );
}

export async function deleteRole(id: number): Promise<void> {
  return executeWithRefresh((repo) =>
    new DeleteRoleUsecase(repo).execute({ id }),
  );
}

export async function getPermissions(): Promise<Permission[]> {
  return executeWithRefresh((repo) =>
    new GetPermissionsUsecase(repo).execute({}),
  );
}

export async function getResources(): Promise<string[]> {
  return executeWithRefresh((repo) =>
    new GetResourcesUsecase(repo).execute({}),
  );
}

export async function createPermission(
  data: CreatePermissionParams,
): Promise<Permission> {
  return executeWithRefresh((repo) =>
    new CreatePermissionUsecase(repo).execute(data),
  );
}

export async function deletePermission(id: number): Promise<void> {
  return executeWithRefresh((repo) =>
    new DeletePermissionUsecase(repo).execute({ id }),
  );
}

export async function getRolePermissions(roleId: number): Promise<number[]> {
  return executeWithRefresh((repo) =>
    new GetRolePermissionsUsecase(repo).execute({ roleId }),
  );
}

export async function assignPermissionToRole(
  roleId: number,
  permissionId: number,
): Promise<void> {
  return executeWithRefresh((repo) =>
    new AssignPermissionToRoleUsecase(repo).execute({ roleId, permissionId }),
  );
}

export async function removePermissionFromRole(
  roleId: number,
  permissionId: number,
): Promise<void> {
  return executeWithRefresh((repo) =>
    new RemovePermissionFromRoleUsecase(repo).execute({ roleId, permissionId }),
  );
}

export async function getUserRoles(userId: string): Promise<Role[]> {
  return executeWithRefresh((repo) =>
    new GetUserRolesUsecase(repo).execute({ userId }),
  );
}

export async function assignRoleToUser(
  userId: string,
  roleId: number,
): Promise<void> {
  return executeWithRefresh((repo) =>
    new AssignRoleToUserUsecase(repo).execute({ userId, roleId }),
  );
}

export async function removeRoleFromUser(
  userId: string,
  roleId: number,
): Promise<void> {
  return executeWithRefresh((repo) =>
    new RemoveRoleFromUserUsecase(repo).execute({ userId, roleId }),
  );
}

export async function getUserPermissions(
  userId: string,
): Promise<Permission[]> {
  return executeWithRefresh((repo) =>
    new GetUserPermissionsUsecase(repo).execute({ userId }),
  );
}

export async function grantUserPermission(
  userId: string,
  permissionId: number,
): Promise<void> {
  return executeWithRefresh((repo) =>
    new GrantUserPermissionUsecase(repo).execute({
      userId,
      permissionId,
      isGranted: true,
    }),
  );
}

export async function revokeUserPermission(
  userId: string,
  permissionId: number,
): Promise<void> {
  return executeWithRefresh((repo) =>
    new RevokeUserPermissionUsecase(repo).execute({ userId, permissionId }),
  );
}

export async function getMatrix(): Promise<RolePermissionMatrix> {
  const [roles, permissions] = await Promise.all([
    getRoles(),
    getPermissions(),
  ]);
  const rolePerms = await Promise.all(
    roles.map((r) =>
      getRolePermissions(r.id).then((permIds) => ({ id: r.id, permIds })),
    ),
  );
  const matrix: Record<number, number[]> = {};
  rolePerms.forEach(({ id, permIds }) => {
    matrix[id] = permIds;
  });
  return { roles, permissions, matrix };
}
