import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumReportEntity } from '../entities/forum-report.entity';
import {
  CreateReportInput,
  GetReportsInput,
  IForumReportRepository,
} from '../../../domain/repositories/forum-report.repository.interface';
import type {
  ForumReportDomain,
  ReportStatus,
  ReportTargetType,
} from '../../../domain/entities/forum-report.domain';

@Injectable()
export class ForumReportRepository implements IForumReportRepository {
  constructor(
    @InjectRepository(ForumReportEntity)
    private readonly repo: Repository<ForumReportEntity>,
  ) {}

  private toDomain(e: ForumReportEntity): ForumReportDomain {
    return {
      id: e.id,
      reporterId: e.reporterId,
      targetType: e.targetType as ReportTargetType,
      targetId: e.targetId,
      reason: e.reason,
      description: e.description,
      status: e.status as ReportStatus,
      resolvedBy: e.resolvedBy,
      resolutionNote: e.resolutionNote,
      resolvedAt: e.resolvedAt,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }

  async create(input: CreateReportInput): Promise<ForumReportDomain> {
    const entity = this.repo.create({
      reporterId: input.reporterId,
      targetType: input.targetType,
      targetId: input.targetId,
      reason: input.reason,
      description: input.description ?? null,
      status: 'pending',
    });
    return this.toDomain(await this.repo.save(entity));
  }

  async findById(id: string): Promise<ForumReportDomain | null> {
    const e = await this.repo.findOne({ where: { id } });
    return e ? this.toDomain(e) : null;
  }

  async findByReporterAndTarget(
    reporterId: string,
    targetType: ReportTargetType,
    targetId: string,
  ): Promise<ForumReportDomain | null> {
    const e = await this.repo.findOne({
      where: { reporterId, targetType, targetId },
    });
    return e ? this.toDomain(e) : null;
  }

  async findByForum(input: GetReportsInput): Promise<{
    data: ForumReportDomain[];
    total: number;
  }> {
    const { status, targetType, page = 1, limit = 20 } = input;
    const qb = this.repo.createQueryBuilder('r');
    if (status) qb.andWhere('r.status = :status', { status });
    if (targetType) qb.andWhere('r.targetType = :targetType', { targetType });

    const [entities, total] = await qb
      .orderBy('r.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data: entities.map(this.toDomain.bind(this)), total };
  }

  async updateStatus(
    id: string,
    status: string,
    resolvedBy: string,
    resolutionNote?: string,
  ): Promise<ForumReportDomain> {
    const updateData: Record<string, unknown> = {
      status,
      resolvedBy,
      resolvedAt: new Date(),
    };
    if (resolutionNote !== undefined)
      updateData.resolutionNote = resolutionNote;
    await this.repo.update(id, updateData as never);
    return this.toDomain(await this.repo.findOneOrFail({ where: { id } }));
  }
}
