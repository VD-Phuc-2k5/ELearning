import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICodingProblemRepository } from '../../../domain/repositories/coding-problem.repository.interface';
import { CodingProblemEntity } from '../entities/coding-problem.entity';
import { CodingProblemDomain } from '../../../domain/entities/coding-problem.domain';

@Injectable()
export class CodingProblemRepository implements ICodingProblemRepository {
  constructor(
    @InjectRepository(CodingProblemEntity)
    private readonly repo: Repository<CodingProblemEntity>,
  ) {}

  private toDomain(entity: CodingProblemEntity): CodingProblemDomain {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      difficulty: entity.difficulty,
      timeLimitMs: entity.timeLimitMs,
      memoryLimitMb: entity.memoryLimitMb,
      sampleInput: entity.sampleInput,
      sampleOutput: entity.sampleOutput,
      languages: entity.languages,
      templates: entity.templates,
      wrappers: entity.wrappers,
      creatorId: entity.creatorId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  async create(
    problem: Omit<CodingProblemDomain, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<CodingProblemDomain> {
    const entity = this.repo.create(problem);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async update(
    id: string,
    problem: Partial<
      Omit<CodingProblemDomain, 'id' | 'creatorId' | 'createdAt' | 'updatedAt'>
    >,
  ): Promise<CodingProblemDomain> {
    await this.repo.update(id, problem);
    const updated = await this.repo.findOneBy({ id });
    if (!updated) {
      throw new Error(`CodingProblem with id ${id} not found after update`);
    }
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async findById(id: string): Promise<CodingProblemDomain | null> {
    const entity = await this.repo.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(options?: {
    difficulty?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: CodingProblemDomain[]; total: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repo.createQueryBuilder('p');

    if (options?.difficulty) {
      queryBuilder.andWhere('p.difficulty = :difficulty', {
        difficulty: options.difficulty,
      });
    }

    queryBuilder.orderBy('p.createdAt', 'DESC').skip(skip).take(limit);

    const [entities, total] = await queryBuilder.getManyAndCount();
    return {
      data: entities.map((e) => this.toDomain(e)),
      total,
    };
  }
}
