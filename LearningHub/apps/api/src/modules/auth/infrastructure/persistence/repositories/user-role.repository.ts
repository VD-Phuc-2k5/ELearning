import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRoleRepository } from '../../../domain/repositories/i-user-role.repository';
import { UserRole } from '../../../domain/entities/user-role.entity';
import { Role } from '../../../domain/entities/role.entity';
import { User } from '../../../domain/entities/user.entity';
import { UserRoleEntity } from '../entities/user-role.entity';
import { UserEntity } from '../entities/user.entity';
import { RoleEntity } from '../entities/role.entity';

@Injectable()
export class UserRoleRepository implements IUserRoleRepository {
  constructor(
    @InjectRepository(UserRoleEntity)
    private readonly repository: Repository<UserRoleEntity>,
  ) {}

  async findByUserId(userId: string): Promise<UserRole[]> {
    const entities = await this.repository.find({
      where: { userId },
      relations: { user: true, role: true, assignedBy: true },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findUserIdsByRoleId(roleId: number): Promise<string[]> {
    const rows = await this.repository.find({
      where: { roleId },
      select: { userId: true },
    });
    return rows.map((r) => r.userId);
  }

  async assign(
    userId: string,
    roleId: number,
    assignedBy: string,
  ): Promise<UserRole> {
    const entity = this.repository.create({
      userId,
      roleId,
      assignedBy: assignedBy ? ({ id: assignedBy } as UserEntity) : null,
    });
    const saved = await this.repository.save(entity);
    const loaded = await this.repository.findOne({
      where: { id: saved.id },
      relations: { user: true, role: true, assignedBy: true },
    });
    if (!loaded) throw new Error('UserRole not found after save');
    return this.toDomain(loaded);
  }

  async remove(userId: string, roleId: number): Promise<void> {
    await this.repository.delete({ userId, roleId });
  }

  async exists(userId: string, roleId: number): Promise<boolean> {
    return this.repository.existsBy({ userId, roleId });
  }

  private toDomain(entity: UserRoleEntity): UserRole {
    return new UserRole(
      entity.id,
      this.toUserDomain(entity.user),
      this.toRoleDomain(entity.role),
      entity.assignedBy?.id ?? '',
      entity.assignedAt,
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

  private toRoleDomain(entity: RoleEntity): Role {
    return {
      id: entity.id,
      code: entity.code,
      name: entity.name,
      description: entity.description,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    } as Role;
  }
}
