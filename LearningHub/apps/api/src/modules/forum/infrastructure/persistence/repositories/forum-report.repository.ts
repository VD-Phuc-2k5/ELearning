import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumReportEntity } from '../entities/forum-report.entity';
import {
  CreateReportInput,
  FindAllWithDetailsInput,
  FindByTargetInput,
  GetReportsInput,
  IForumReportRepository,
} from '../../../domain/repositories/forum-report.repository.interface';
import type {
  AdminReportDetail,
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

  async findByTarget(input: FindByTargetInput): Promise<ForumReportDomain[]> {
    const { targetType, targetId } = input;
    const rows = await this.repo.manager.query(
      `SELECT r.*, u.username AS reporter_name
       FROM forum_reports r
       LEFT JOIN users u ON r.reporter_id = u.id
       WHERE r.target_type = $1 AND r.target_id = $2
       ORDER BY r.created_at ASC`,
      [targetType, targetId],
    );
    return rows.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      reporterId: row.reporter_id as string,
      reporterName: (row.reporter_name as string) ?? undefined,
      targetType: row.target_type as ReportTargetType,
      targetId: row.target_id as string,
      reason: row.reason as string,
      description: row.description as string | null,
      status: row.status as ReportStatus,
      resolvedBy: row.resolved_by as string | null,
      resolutionNote: row.resolution_note as string | null,
      resolvedAt: row.resolved_at as Date | null,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    }));
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

  async findAllWithDetails(input: FindAllWithDetailsInput): Promise<{
    data: AdminReportDetail[];
    total: number;
  }> {
    const { status, targetType, page = 1, limit = 20 } = input;

    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (status) {
      conditions.push(`r.status = $${idx++}`);
      values.push(status);
    }
    if (targetType) {
      conditions.push(`r.target_type = $${idx++}`);
      values.push(targetType);
    }
    const whereSQL =
      conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : '';

    const countValues = [...values];
    const countSQL = `
      SELECT COUNT(DISTINCT r.id) AS total
      FROM forum_reports r
      LEFT JOIN forum_posts p ON r.target_id = p.id AND r.target_type = 'post'
      WHERE 1=1 ${whereSQL}
    `;
    const countResult = await this.repo.manager.query(countSQL, countValues);
    const total = parseInt(countResult[0]?.total ?? '0', 10);

    const queryValues = [...values, limit, (page - 1) * limit];
    const querySQL = `
      SELECT
        r.id, r.reporter_id, r.target_type, r.target_id,
        r.reason, r.description, r.status,
        r.resolved_by, r.resolution_note, r.resolved_at,
        r.created_at, r.updated_at,
        u.username AS reporter_name,
        p.title AS post_title,
        p.content AS post_content,
        p.status AS post_status,
        f.id AS forum_id,
        f.slug AS forum_slug,
        f.name AS forum_name
      FROM forum_reports r
      LEFT JOIN users u ON r.reporter_id = u.id
      LEFT JOIN forum_posts p ON r.target_id = p.id AND r.target_type = 'post'
      LEFT JOIN forums f ON p.forum_id = f.id
      WHERE 1=1 ${whereSQL}
      ORDER BY r.created_at DESC
      LIMIT $${idx++} OFFSET $${idx}
    `;

    const rows = await this.repo.manager.query(querySQL, queryValues);

    const data: AdminReportDetail[] = rows.map(
      (row: Record<string, unknown>) => ({
        id: row.id as string,
        reporterId: row.reporter_id as string,
        targetType: row.target_type as ReportTargetType,
        targetId: row.target_id as string,
        reason: row.reason as string,
        description: row.description as string | null,
        status: row.status as ReportStatus,
        resolvedBy: row.resolved_by as string | null,
        resolutionNote: row.resolution_note as string | null,
        resolvedAt: row.resolved_at as Date | null,
        createdAt: row.created_at as Date,
        updatedAt: row.updated_at as Date,
        reporterName: row.reporter_name as string,
        postTitle: row.post_title as string | null,
        postContent: (row.post_content as Record<string, unknown>) ?? null,
        postStatus: row.post_status as string | null,
        forumId: row.forum_id as string | null,
        forumSlug: row.forum_slug as string | null,
        forumName: row.forum_name as string | null,
      }),
    );

    return { data, total };
  }

  async deleteResolvedBefore(date: Date): Promise<number> {
    const result = await this.repo
      .createQueryBuilder()
      .delete()
      .where('status IN (:...statuses)', {
        statuses: ['resolved', 'dismissed'],
      })
      .andWhere('resolved_at < :date', { date })
      .execute();
    return result.affected ?? 0;
  }
}
