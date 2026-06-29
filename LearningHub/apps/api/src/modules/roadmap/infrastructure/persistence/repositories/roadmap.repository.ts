import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoadmapEntity } from '../entities/roadmap.entity';
import {
  IRoadmapRepository,
  CreateRoadmapInput,
  GetRoadmapListInput,
  UpdateRoadmapInput,
} from '../../../domain/repositories/roadmap.repository.interface';
import { RoadmapDomain } from '../../../domain/entities/roadmap.domain';

@Injectable()
export class RoadmapRepository implements IRoadmapRepository {
  constructor(
    @InjectRepository(RoadmapEntity)
    private readonly repo: Repository<RoadmapEntity>,
  ) {}

  private toDomain(e: RoadmapEntity): RoadmapDomain {
    return {
      id: e.id,
      title: e.title,
      description: e.description,
      creatorId: e.creatorId,
      status: e.status as RoadmapDomain['status'],
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }

  async create(input: CreateRoadmapInput): Promise<RoadmapDomain> {
    const entity = this.repo.create({
      title: input.title,
      description: input.description ?? null,
      creatorId: input.creatorId,
      status: 'draft',
    });
    return this.toDomain(await this.repo.save(entity));
  }

  async findAll(
    input: GetRoadmapListInput,
  ): Promise<{ data: RoadmapDomain[]; total: number }> {
    const { page = 1, limit = 10, search, status, creatorId } = input;
    const qb = this.repo.createQueryBuilder('r');

    if (search) qb.andWhere('r.title ILIKE :search', { search: `%${search}%` });
    if (status) qb.andWhere('r.status = :status', { status });
    if (creatorId) qb.andWhere('r.creatorId = :creatorId', { creatorId });

    const [entities, total] = await qb
      .orderBy('r.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: entities.map(this.toDomain.bind(this)), total };
  }

  async findById(id: string): Promise<RoadmapDomain | null> {
    const e = await this.repo.findOne({ where: { id } });
    return e ? this.toDomain(e) : null;
  }

  async update(id: string, input: UpdateRoadmapInput): Promise<RoadmapDomain> {
    await this.repo.update(id, {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.status !== undefined && { status: input.status }),
    });
    const updated = await this.repo.findOneOrFail({ where: { id } });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
