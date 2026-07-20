import { Permission } from '../../domain/entities/permission.entity';

export interface PermissionResponse {
  id: number;
  code: string;
  name: string;
  description: string;
  resource: string;
  action: string;
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
