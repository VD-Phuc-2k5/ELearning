import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserPermissionRepository } from '../../../domain/repositories/i-user-permission.repository';
import { UserPermission } from '../../../domain/entities/user-permission.entity';
import { Permission } from '../../../domain/entities/permission.entity';
import { User } from '../../../domain/entities/user.entity';
import { UserPermissionEntity } from '../entities/user-permission.entity';
import { UserEntity } from '../entities/user.entity';
import { PermissionEntity } from '../entities/permission.entity';

@Injectable()
export class UserPermissionRepository implements IUserPermissionRepository {
  constructor(
    @InjectRepository(UserPermissionEntity)
    private readonly repository: Repository<UserPermissionEntity>,
  ) {}

  async findByUserId(userId: string): Promise<UserPermission[]> {
    const entities = await this.repository.find({
      where: { userId },
      relations: { user: true, permission: true, grantedBy: true },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async upsert(
    userId: string,
    permissionId: number,
    isGranted: boolean,
    grantedBy: string,
  ): Promise<UserPermission> {
    let entity = await this.repository.findOne({
      where: { userId, permissionId },
    });
    if (entity) {
      entity.isGranted = isGranted;
      entity.grantedBy = grantedBy ? ({ id: grantedBy } as UserEntity) : null;
    } else {
      entity = this.repository.create({
        userId,
        permissionId,
        isGranted,
        grantedBy: grantedBy ? ({ id: grantedBy } as UserEntity) : null,
      });
    }
    const saved = await this.repository.save(entity);
    const loaded = await this.repository.findOne({
      where: { id: saved.id },
      relations: { user: true, permission: true, grantedBy: true },
    });
    return this.toDomain(loaded!);
  }

  async remove(userId: string, permissionId: number): Promise<void> {
    await this.repository.delete({ userId, permissionId });
  }

  private toDomain(entity: UserPermissionEntity): UserPermission {
    return new UserPermission(
      entity.id,
      this.toUserDomain(entity.user),
      this.toPermissionDomain(entity.permission),
      entity.isGranted,
      entity.grantedBy?.id ?? '',
      entity.grantedAt,
    );
  }

  private toUserDomain(entity: UserEntity): User {
    return new User(
      entity.id,
      entity.email,
      '',
      entity.username,
      entity.avatarUrl,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt,
      entity.lockedAt,
    );
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
