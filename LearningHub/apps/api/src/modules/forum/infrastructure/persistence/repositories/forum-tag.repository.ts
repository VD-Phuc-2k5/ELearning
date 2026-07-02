import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumTagEntity } from '../entities/forum-tag.entity';
import {
  CreateTagInput,
  IForumTagRepository,
  UpdateTagInput,
} from '../../../domain/repositories/forum-tag.repository.interface';
import type { ForumTagDomain } from '../../../domain/entities/forum-tag.domain';

@Injectable()
export class ForumTagRepository implements IForumTagRepository {
  constructor(
    @InjectRepository(ForumTagEntity)
    private readonly repo: Repository<ForumTagEntity>,
  ) {}

  private toDomain(e: ForumTagEntity): ForumTagDomain {
    return {
      id: e.id,
      name: e.name,
      slug: e.slug,
      color: e.color,
    };
  }

  async findAll(): Promise<ForumTagDomain[]> {
    const entities = await this.repo.find({ order: { name: 'ASC' } });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: number): Promise<ForumTagDomain | null> {
    const e = await this.repo.findOne({ where: { id } });
    return e ? this.toDomain(e) : null;
  }

  async create(input: CreateTagInput): Promise<ForumTagDomain> {
    const slug = input.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const entity = this.repo.create({
      name: input.name,
      slug,
      color: input.color ?? null,
    });
    return this.toDomain(await this.repo.save(entity));
  }

  async update(id: number, input: UpdateTagInput): Promise<ForumTagDomain> {
    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) {
      updateData.name = input.name;
      updateData.slug = input.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    if (input.color !== undefined) updateData.color = input.color;
    await this.repo.update(id, updateData as never);
    const updated = await this.repo.findOneOrFail({ where: { id } });
    return this.toDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
