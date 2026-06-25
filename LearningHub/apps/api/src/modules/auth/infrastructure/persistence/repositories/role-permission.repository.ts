import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { IRolePermissionRepository } from '../../../domain/repositories/i-role-permission.repository';
import { Permission } from '../../../domain/entities/permission.entity';
import { RolePermissionEntity } from '../entities/role-permission.entity';
import { PermissionEntity } from '../entities/permission.entity';

@Injectable()
export class RolePermissionRepository implements IRolePermissionRepository {
  constructor(
    @InjectRepository(RolePermissionEntity)
    private readonly repository: Repository<RolePermissionEntity>,
  ) {}

  async findPermissionsByRoleId(roleId: number): Promise<Permission[]> {
    const records = await this.repository.find({
      where: { roleId },
      relations: { permission: true },
    });
    return records.map((r) => this.toPermissionDomain(r.permission));
  }

  async findPermissionCodesByRoleIds(roleIds: number[]): Promise<string[]> {
    if (roleIds.length === 0) return [];
    const records = await this.repository.find({
      where: { roleId: In(roleIds) },
      relations: { permission: true },
    });
    return records.map((r) => r.permission.code);
  }

  async assign(roleId: number, permissionId: number): Promise<void> {
    const record = this.repository.create({ roleId, permissionId });
    await this.repository.save(record);
  }

  async remove(roleId: number, permissionId: number): Promise<void> {
    await this.repository.delete({ roleId, permissionId });
  }

  async exists(roleId: number, permissionId: number): Promise<boolean> {
    return this.repository.existsBy({ roleId, permissionId });
  }

  private toPermissionDomain(entity: PermissionEntity): Permission {
    return {
      id: entity.id,
      code: entity.code,
      name: entity.name,
      description: entity.description,
      resource: entity.resource,
      action: entity.action,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    } as Permission;
  }
}
