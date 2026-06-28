import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionBankEntity } from '../entities/question-bank.entity';
import { BankTagEntity } from '../entities/bank-tag.entity';
import {
  IQuestionBankRepository,
  CreateQuestionBankInput,
  GetQuestionBankListInput,
  UpdateQuestionBankInput,
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
      passingScore: Number(entity.passingScore),
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
      tags: input.tagIds?.map((id) => ({ id })),
    });
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async findAll(
    input: GetQuestionBankListInput,
  ): Promise<{ data: QuestionBankDomain[]; total: number }> {
    const { page = 1, limit = 10, search, tagId, statusId, uploaderId } = input;
    const qb = this.repo
      .createQueryBuilder('bank')
      .leftJoinAndSelect('bank.tags', 'tag')
      .leftJoinAndSelect('bank.status', 'status');

    if (uploaderId) {
      qb.andWhere('bank.uploaderId = :uploaderId', { uploaderId });
    }
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

  async update(
    id: string,
    input: UpdateQuestionBankInput,
  ): Promise<QuestionBankDomain> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: { tags: true },
    });
    if (!entity) {
      throw new Error(`Không tìm thấy ngân hàng câu hỏi với ID: ${id}`);
    }

    if (input.title !== undefined) entity.title = input.title;
    if (input.description !== undefined) entity.description = input.description;
    if (input.statusId !== undefined) entity.statusId = input.statusId;
    if (input.fileHash !== undefined) entity.fileHash = input.fileHash;
    if (input.tagIds !== undefined) {
      entity.tags = input.tagIds.map((tagId) => ({
        id: tagId,
      })) as BankTagEntity[];
    }

    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async findByHash(
    hash: string,
    uploaderId?: string,
  ): Promise<QuestionBankDomain | null> {
    const entity = await this.repo.findOne({
      where: { fileHash: hash, ...(uploaderId ? { uploaderId } : {}) },
      relations: { tags: true, status: true },
    });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findDerivedBanks(
    fileHash: string,
    excludeUploaderId: string,
  ): Promise<
    Array<{
      id: string;
      title: string;
      createdAt: Date;
      uploaderUsername: string;
    }>
  > {
    const rows = await this.repo
      .createQueryBuilder('bank')
      .leftJoin('bank.uploader', 'uploader')
      .select(['bank.id', 'bank.title', 'bank.createdAt', 'uploader.username'])
      .where('bank.fileHash = :fileHash', { fileHash })
      .andWhere('bank.uploaderId != :excludeUploaderId', { excludeUploaderId })
      .getRawMany();
    return rows.map((r) => ({
      id: r.bank_id,
      title: r.bank_title,
      createdAt: r.bank_created_at,
      uploaderUsername: r.uploader_username,
    }));
  }
}
