'use server';

import { Either, Failure } from '@learning-hub/core';
import {
  AuthRemoteDataSourceImpl,
  AuthRepositoryImpl,
} from '@learning-hub/data';
import {
  AdminRegisterUsecase,
  AssignPermissionToRoleUsecase,
  AssignRoleToUserUsecase,
  CreatePermissionParams,
  CreatePermissionUsecase,
  CreateRoleParams,
  CreateRoleUsecase,
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
  Permission,
  RegisterParams,
  RemovePermissionFromRoleUsecase,
  RemoveRoleFromUserUsecase,
  RevokeUserPermissionUsecase,
  Role,
  UpdateRoleParams,
  UpdateRoleUsecase,
  User,
} from '@learning-hub/domain';
import { cookies } from 'next/headers';

export type { Permission, Role, User };

export interface MatrixData {
  roles: Role[];
  permissions: Permission[];
  matrix: Record<number, number[]>;
}

function unwrap<T>(r: Either<Failure, T>): T {
  if (r.type === 'left') throw new Error(r.value.message);
  return r.value;
}

async function getRepo() {
  const token = (await cookies()).get('adminToken')?.value ?? '';
  return new AuthRepositoryImpl(new AuthRemoteDataSourceImpl(), token);
}

export async function getUsers(): Promise<User[]> {
  const repo = await getRepo();
  return unwrap(await new GetUsersUsecase(repo).execute({}));
}

export async function registerAdmin(data: RegisterParams): Promise<User> {
  const repo = await getRepo();
  return unwrap(await new AdminRegisterUsecase(repo).execute(data));
}

export async function getRoles(): Promise<Role[]> {
  const repo = await getRepo();
  return unwrap(await new GetRolesUsecase(repo).execute({}));
}

export async function createRole(data: CreateRoleParams): Promise<Role> {
  const repo = await getRepo();
  return unwrap(await new CreateRoleUsecase(repo).execute(data));
}

export async function updateRole(
  id: number,
  data: UpdateRoleParams,
): Promise<Role> {
  const repo = await getRepo();
  return unwrap(await new UpdateRoleUsecase(repo).execute({ id, data }));
}

export async function deleteRole(id: number): Promise<void> {
  const repo = await getRepo();
  unwrap(await new DeleteRoleUsecase(repo).execute({ id }));
}

export async function getPermissions(): Promise<Permission[]> {
  const repo = await getRepo();
  return unwrap(await new GetPermissionsUsecase(repo).execute({}));
}

export async function getResources(): Promise<string[]> {
  const repo = await getRepo();
  return unwrap(await new GetResourcesUsecase(repo).execute({}));
}

export async function createPermission(
  data: CreatePermissionParams,
): Promise<Permission> {
  const repo = await getRepo();
  return unwrap(await new CreatePermissionUsecase(repo).execute(data));
}

export async function deletePermission(id: number): Promise<void> {
  const repo = await getRepo();
  unwrap(await new DeletePermissionUsecase(repo).execute({ id }));
}

export async function getRolePermissions(roleId: number): Promise<number[]> {
  const repo = await getRepo();
  return unwrap(await new GetRolePermissionsUsecase(repo).execute({ roleId }));
}

export async function assignPermissionToRole(
  roleId: number,
  permissionId: number,
): Promise<void> {
  const repo = await getRepo();
  unwrap(
    await new AssignPermissionToRoleUsecase(repo).execute({
      roleId,
      permissionId,
    }),
  );
}

export async function removePermissionFromRole(
  roleId: number,
  permissionId: number,
): Promise<void> {
  const repo = await getRepo();
  unwrap(
    await new RemovePermissionFromRoleUsecase(repo).execute({
      roleId,
      permissionId,
    }),
  );
}

export async function getUserRoles(userId: string): Promise<Role[]> {
  const repo = await getRepo();
  return unwrap(await new GetUserRolesUsecase(repo).execute({ userId }));
}

export async function assignRoleToUser(
  userId: string,
  roleId: number,
): Promise<void> {
  const repo = await getRepo();
  unwrap(await new AssignRoleToUserUsecase(repo).execute({ userId, roleId }));
}

export async function removeRoleFromUser(
  userId: string,
  roleId: number,
): Promise<void> {
  const repo = await getRepo();
  unwrap(await new RemoveRoleFromUserUsecase(repo).execute({ userId, roleId }));
}

export async function getUserPermissions(
  userId: string,
): Promise<Permission[]> {
  const repo = await getRepo();
  return unwrap(await new GetUserPermissionsUsecase(repo).execute({ userId }));
}

export async function grantUserPermission(
  userId: string,
  permissionId: number,
): Promise<void> {
  const repo = await getRepo();
  unwrap(
    await new GrantUserPermissionUsecase(repo).execute({
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
  const repo = await getRepo();
  unwrap(
    await new RevokeUserPermissionUsecase(repo).execute({
      userId,
      permissionId,
    }),
  );
}

export async function getMatrix(): Promise<MatrixData> {
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
