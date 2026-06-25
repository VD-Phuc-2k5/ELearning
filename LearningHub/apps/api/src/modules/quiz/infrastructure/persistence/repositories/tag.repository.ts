import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BankTagEntity as BankTagEntityOrm } from '../entities/bank-tag.entity';
import { ITagRepository } from '../../../domain/repositories/tag.repository.interface';
import { BankTagEntity } from '../../../domain/entities/bank-tag.domain';

@Injectable()
export class TagRepository implements ITagRepository {
  constructor(
    @InjectRepository(BankTagEntityOrm)
    private readonly repo: Repository<BankTagEntityOrm>,
  ) {}

  async findAll(): Promise<BankTagEntity[]> {
    return this.repo.find();
  }

  async findByIds(ids: number[]): Promise<BankTagEntity[]> {
    return this.repo.findBy({ id: In(ids) });
  }

  async create(name: string, description?: string): Promise<BankTagEntity> {
    const entity = this.repo.create({ name, description });
    return this.repo.save(entity);
  }

  async update(id: number, name?: string, description?: string): Promise<BankTagEntity> {
    const entity = await this.repo.findOneOrFail({ where: { id } });
    if (name !== undefined) entity.name = name;
    if (description !== undefined) entity.description = description;
    return this.repo.save(entity);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
