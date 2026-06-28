import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionEntity } from '../entities/permission.entity';
import { Repository } from 'typeorm';
import { Permission } from '../../../domain/entities/permission.entity';
import { IPermissionRepository } from '../../../domain/repositories/i-permission.repository';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly repository: Repository<PermissionEntity>,
  ) {}

  async findById(id: number): Promise<Permission | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCode(code: string): Promise<Permission | null> {
    const entity = await this.repository.findOne({ where: { code } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<Permission[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => this.toDomain(entity));
  }

  async create(
    data: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Permission> {
    const entity = await this.repository.save({
      code: data.code,
      name: data.name,
      description: data.description,
      resource: data.resource,
      action: data.action,
    });
    return this.toDomain(entity);
  }

  async update(permission: Permission): Promise<Permission> {
    const entity = await this.repository.save(this.fromDomain(permission));
    return this.toDomain(entity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  toDomain(entity: PermissionEntity): Permission {
    return {
      id: entity.id,
      code: entity.code,
      name: entity.name,
      description: entity.description,
      resource: entity.resource,
      action: entity.action,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  fromDomain(permission: Permission): PermissionEntity {
    return {
      id: permission.id,
      code: permission.code,
      name: permission.name,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    };
  }
}
