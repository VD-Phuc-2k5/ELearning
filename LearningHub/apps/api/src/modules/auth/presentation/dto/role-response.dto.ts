import { Role } from '../../domain/entities/role.entity';

export interface RoleResponse {
  id: number;
  code: string;
  name: string;
  description: string;
}

export function toRoleResponse(role: Role): RoleResponse {
  return {
    id: role.id,
    code: role.code,
    name: role.name,
    description: role.description,
  };
}
