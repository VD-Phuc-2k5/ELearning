import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { User } from '../../../domain/entities/user.entity';
import { IUserRepository } from '../../../domain/repositories/i-user.repository';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async findUsersByRole(
    roleCode: string,
    excludeUserId: string,
  ): Promise<User[]> {
    const entities = await this.repository
      .createQueryBuilder('user')
      .where(
        `EXISTS (
          SELECT 1 FROM user_roles ur
          JOIN roles r ON r.id = ur.role_id
          WHERE ur.user_id = user.id AND UPPER(r.code) = UPPER(:roleCode)
        )`,
        { roleCode },
      )
      .andWhere('user.id != :excludeUserId', { excludeUserId })
      .getMany();
    return entities.map(
      (e) =>
        new User(
          e.id,
          e.email,
          '',
          e.username,
          e.avatarUrl,
          e.isActive,
          e.createdAt,
          e.updatedAt,
          e.lockedAt,
        ),
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { username } });
    return entity ? this.toDomain(entity) : null;
  }

  async searchByEmail(keyword: string): Promise<User[]> {
    const qb = this.repository.createQueryBuilder('user');
    if (keyword.trim()) {
      qb.andWhere('user.email ILIKE :kw', { kw: `%${keyword.trim()}%` });
    }
    const entities = await qb.orderBy('user.createdAt', 'DESC').getMany();
    return entities.map(this.toDomain.bind(this));
  }

  async create(user: User): Promise<User> {
    const entity = await this.repository.save(this.fromDomain(user));
    return this.toDomain(entity);
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async update(user: User): Promise<User> {
    const entity = await this.repository.save(this.fromDomain(user));
    return this.toDomain(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private toDomain(entity: UserEntity): User {
    return new User(
      entity.id,
      entity.email,
      entity.password,
      entity.username,
      entity.avatarUrl,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt,
      entity.lockedAt,
    );
  }

  private fromDomain(user: User): UserEntity {
    return {
      id: user.id,
      email: user.email,
      password: user.getPassword(),
      username: user.username,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lockedAt: user.lockedAt,
    };
  }
}
