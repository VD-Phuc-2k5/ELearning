import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionBankEntity } from '../entities/question-bank.entity';
import {
  IQuestionBankRepository,
  CreateQuestionBankInput,
  GetQuestionBankListInput,
} from '../../../domain/repositories/question-bank.repository.interface';
import { QuestionBankDomain } from '../../../domain/entities/question-bank.domain';

@Injectable()
export class QuestionBankRepository implements IQuestionBankRepository {
  constructor(
    @InjectRepository(QuestionBankEntity)
    private readonly repo: Repository<QuestionBankEntity>,
  ) {}

  private toDomain(entity: QuestionBankEntity): QuestionBankDomain {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      uploaderId: entity.uploaderId,
      fileHash: entity.fileHash,
      totalQuestions: entity.totalQuestions,
      statusId: entity.statusId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      tags: entity.tags?.map((t) => ({ id: t.id, name: t.name })),
    };
  }

  async create(input: CreateQuestionBankInput): Promise<QuestionBankDomain> {
    const entity = this.repo.create({
      title: input.title,
      description: input.description,
      uploaderId: input.uploaderId,
      statusId: 'draft',
      tags: input.tagIds?.map((id) => ({ id })) as any,
    });
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async findAll(
    input: GetQuestionBankListInput,
  ): Promise<{ data: QuestionBankDomain[]; total: number }> {
    const { page = 1, limit = 10, search, tagId, statusId } = input;
    const qb = this.repo
      .createQueryBuilder('bank')
      .leftJoinAndSelect('bank.tags', 'tag')
      .leftJoinAndSelect('bank.status', 'status');

    if (search) {
      qb.andWhere('bank.title ILIKE :search', { search: `%${search}%` });
    }
    if (tagId) {
      qb.andWhere('tag.id = :tagId', { tagId });
    }
    if (statusId) {
      qb.andWhere('bank.statusId = :statusId', { statusId });
    }

    const [entities, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: entities.map(this.toDomain.bind(this)), total };
  }

  async findById(id: string): Promise<QuestionBankDomain | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: { tags: true, status: true },
    });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async updateTotalQuestions(id: string, total: number): Promise<void> {
    await this.repo.update(id, { totalQuestions: total });
  }
}
