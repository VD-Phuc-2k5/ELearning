import { UserRole } from '../../domain/entities/user-role.entity';
import { UserResponse, toUserResponse } from './user-response.dto';
import { RoleResponse, toRoleResponse } from './role-response.dto';

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
