export const FORUM_REPORT_REPOSITORY = Symbol('IForumReportRepository');

import type {
  AdminReportDetail,
  ForumReportDomain,
  ReportTargetType,
} from '../entities/forum-report.domain';

export interface CreateReportInput {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description?: string;
}

export interface GetReportsInput {
  forumId?: string;
  status?: string;
  targetType?: string;
  page?: number;
  limit?: number;
}

export interface FindAllWithDetailsInput {
  status?: string;
  targetType?: string;
  page?: number;
  limit?: number;
}

export interface FindByTargetInput {
  targetType: ReportTargetType;
  targetId: string;
}

export interface IForumReportRepository {
  create(input: CreateReportInput): Promise<ForumReportDomain>;
  findById(id: string): Promise<ForumReportDomain | null>;
  findByReporterAndTarget(
    reporterId: string,
    targetType: ReportTargetType,
    targetId: string,
  ): Promise<ForumReportDomain | null>;
  findByForum(input: GetReportsInput): Promise<{
    data: ForumReportDomain[];
    total: number;
  }>;
  findByTarget(input: FindByTargetInput): Promise<ForumReportDomain[]>;
  updateStatus(
    id: string,
    status: string,
    resolvedBy: string,
    resolutionNote?: string,
  ): Promise<ForumReportDomain>;
  findAllWithDetails(
    input: FindAllWithDetailsInput,
  ): Promise<{ data: AdminReportDetail[]; total: number }>;
  deleteResolvedBefore(date: Date): Promise<number>;
}
