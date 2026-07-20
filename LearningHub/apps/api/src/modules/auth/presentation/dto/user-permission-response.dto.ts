import { UserPermission } from '../../domain/entities/user-permission.entity';
import { UserResponse, toUserResponse } from './user-response.dto';
import {
  PermissionResponse,
  toPermissionResponse,
} from './permission-response.dto';

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
