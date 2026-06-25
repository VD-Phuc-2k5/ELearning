import { User } from '../../domain/entities/user.entity';
import { Role } from '../../domain/entities/role.entity';
import { Permission } from '../../domain/entities/permission.entity';
import { UserRole } from '../../domain/entities/user-role.entity';
import { UserPermission } from '../../domain/entities/user-permission.entity';

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  avatarUrl: string;
  isActive: boolean;
  createdAt: Date;
}

export interface RoleResponse {
  id: number;
  code: string;
  name: string;
  description: string;
}

export interface PermissionResponse {
  id: number;
  code: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface UserRolesResponse {
  user: UserResponse;
  roles: Array<RoleResponse & { assignedAt: Date; assignedBy: string }>;
}

export interface UserRoleResponse {
  id: number;
  role: RoleResponse;
  assignedAt: Date;
  assignedBy: string;
}

export interface UserPermissionsResponse {
  user: UserResponse;
  permissions: Array<
    PermissionResponse & {
      isGranted: boolean;
      grantedAt: Date;
      grantedBy: string;
    }
  >;
}

export interface UserPermissionResponse {
  id: number;
  permission: PermissionResponse;
  isGranted: boolean;
  grantedAt: Date;
  grantedBy: string;
}

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

export function toRoleResponse(role: Role): RoleResponse {
  return {
    id: role.id,
    code: role.code,
    name: role.name,
    description: role.description,
  };
}

export function toPermissionResponse(
  permission: Permission,
): PermissionResponse {
  return {
    id: permission.id,
    code: permission.code,
    name: permission.name,
    description: permission.description,
    resource: permission.resource,
    action: permission.action,
  };
}

export function toUserRoleResponse(userRole: UserRole): UserRoleResponse {
  return {
    id: userRole.id,
    role: toRoleResponse(userRole.role),
    assignedAt: userRole.assignedAt,
    assignedBy: userRole.assignedBy,
  };
}

export function toUserRolesResponse(userRoles: UserRole[]): UserRolesResponse {
  if (userRoles.length === 0)
    return { user: null as unknown as UserResponse, roles: [] };
  return {
    user: toUserResponse(userRoles[0].user),
    roles: userRoles.map((ur) => ({
      ...toRoleResponse(ur.role),
      assignedAt: ur.assignedAt,
      assignedBy: ur.assignedBy,
    })),
  };
}

export function toUserPermissionResponse(
  up: UserPermission,
): UserPermissionResponse {
  return {
    id: up.id,
    permission: toPermissionResponse(up.permission),
    isGranted: up.isGranted,
    grantedAt: up.grantedAt,
    grantedBy: up.grantedBy,
  };
}

export function toUserPermissionsResponse(
  userPermissions: UserPermission[],
): UserPermissionsResponse {
  if (userPermissions.length === 0)
    return { user: null as unknown as UserResponse, permissions: [] };
  return {
    user: toUserResponse(userPermissions[0].user),
    permissions: userPermissions.map((up) => ({
      ...toPermissionResponse(up.permission),
      isGranted: up.isGranted,
      grantedAt: up.grantedAt,
      grantedBy: up.grantedBy,
    })),
  };
}
