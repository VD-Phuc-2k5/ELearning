import { UserRole } from '../entities/user-role.entity';

export interface IUserRoleRepository {
  findByUserId(userId: string): Promise<UserRole[]>;
  findUserIdsByRoleId(roleId: number): Promise<string[]>;
  assign(userId: string, roleId: number, assignedBy: string): Promise<UserRole>;
  remove(userId: string, roleId: number): Promise<void>;
  exists(userId: string, roleId: number): Promise<boolean>;
}
