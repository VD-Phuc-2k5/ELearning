'use server';

import { unwrap } from '@learning-hub/core';
import {
  AuthRemoteDataSourceImpl,
  AuthRepositoryImpl,
} from '@learning-hub/data';
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

function makeRepo() {
  return new AuthRepositoryImpl(new AuthRemoteDataSourceImpl());
}

async function exec<T>(
  fn: (
    repo: AuthRepositoryImpl,
  ) => Promise<
    import('@learning-hub/core').Either<import('@learning-hub/core').Failure, T>
  >,
): Promise<T> {
  return unwrap(await fn(makeRepo()));
}

export async function getUsers(role?: string): Promise<User[]> {
  return exec((repo) => new GetUsersUsecase(repo).execute({ role }));
}

export async function registerAdmin(data: RegisterParams): Promise<User> {
  return exec((repo) => new AdminRegisterUsecase(repo).execute(data));
}

export async function updateAdmin(
  id: string,
  data: UpdateAdminParams,
): Promise<User> {
  return exec((repo) => new UpdateAdminUsecase(repo).execute({ id, ...data }));
}

export async function deleteAdmin(id: string): Promise<void> {
  return exec((repo) => new DeleteAdminUsecase(repo).execute({ id }));
}

export async function searchUsers(email: string): Promise<User[]> {
  return exec((repo) => new SearchUsersUsecase(repo).execute({ email }));
}

export async function toggleUserLock(
  id: string,
  isActive: boolean,
): Promise<User> {
  return exec((repo) => new UpdateAdminUsecase(repo).execute({ id, isActive }));
}

export async function getRoles(): Promise<Role[]> {
  return exec((repo) => new GetRolesUsecase(repo).execute({}));
}

export async function createRole(data: CreateRoleParams): Promise<Role> {
  return exec((repo) => new CreateRoleUsecase(repo).execute(data));
}

export async function updateRole(
  id: number,
  data: UpdateRoleParams,
): Promise<Role> {
  return exec((repo) => new UpdateRoleUsecase(repo).execute({ id, data }));
}

export async function deleteRole(id: number): Promise<void> {
  return exec((repo) => new DeleteRoleUsecase(repo).execute({ id }));
}

export async function getPermissions(): Promise<Permission[]> {
  return exec((repo) => new GetPermissionsUsecase(repo).execute({}));
}

export async function getResources(): Promise<string[]> {
  return exec((repo) => new GetResourcesUsecase(repo).execute({}));
}

export async function createPermission(
  data: CreatePermissionParams,
): Promise<Permission> {
  return exec((repo) => new CreatePermissionUsecase(repo).execute(data));
}

export async function deletePermission(id: number): Promise<void> {
  return exec((repo) => new DeletePermissionUsecase(repo).execute({ id }));
}

export async function getRolePermissions(roleId: number): Promise<number[]> {
  return exec((repo) =>
    new GetRolePermissionsUsecase(repo).execute({ roleId }),
  );
}

export async function assignPermissionToRole(
  roleId: number,
  permissionId: number,
): Promise<void> {
  return exec((repo) =>
    new AssignPermissionToRoleUsecase(repo).execute({ roleId, permissionId }),
  );
}

export async function removePermissionFromRole(
  roleId: number,
  permissionId: number,
): Promise<void> {
  return exec((repo) =>
    new RemovePermissionFromRoleUsecase(repo).execute({ roleId, permissionId }),
  );
}

export async function getUserRoles(userId: string): Promise<Role[]> {
  return exec((repo) => new GetUserRolesUsecase(repo).execute({ userId }));
}

export async function assignRoleToUser(
  userId: string,
  roleId: number,
): Promise<void> {
  return exec((repo) =>
    new AssignRoleToUserUsecase(repo).execute({ userId, roleId }),
  );
}

export async function removeRoleFromUser(
  userId: string,
  roleId: number,
): Promise<void> {
  return exec((repo) =>
    new RemoveRoleFromUserUsecase(repo).execute({ userId, roleId }),
  );
}

export async function getUserPermissions(
  userId: string,
): Promise<Permission[]> {
  return exec((repo) =>
    new GetUserPermissionsUsecase(repo).execute({ userId }),
  );
}

export async function grantUserPermission(
  userId: string,
  permissionId: number,
): Promise<void> {
  return exec((repo) =>
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
  return exec((repo) =>
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
