import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from '../entities/role.entity';
import { Repository } from 'typeorm';
import { IRoleRepository } from '../../../domain/repositories/i-role.repository';
import { Role } from '../../../domain/entities/role.entity';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly repository: Repository<RoleEntity>,
  ) {}

  async findById(id: number): Promise<Role | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCode(code: string): Promise<Role | null> {
    const entity = await this.repository.findOne({ where: { code } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<Role[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => this.toDomain(entity));
  }

  async create(role: Role): Promise<Role> {
    const entity = await this.repository.save(this.fromDomain(role));
    return this.toDomain(entity);
  }

  async update(role: Role): Promise<Role> {
    const entity = await this.repository.save(this.fromDomain(role));
    return this.toDomain(entity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  toDomain(entity: RoleEntity): Role {
    return {
      id: entity.id,
      code: entity.code,
      name: entity.name,
      description: entity.description,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  fromDomain(role: Role): Partial<RoleEntity> {
    return {
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}
