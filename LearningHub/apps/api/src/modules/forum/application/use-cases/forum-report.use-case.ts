import {
  Inject,
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  FORUM_REPORT_REPOSITORY,
  FORUM_MODERATION_LOG_REPOSITORY,
  IForumReportRepository,
  IForumModerationLogRepository,
  type GetReportsInput,
} from '../../domain/repositories/forum-report.repository.interface';
import {
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
} from '../../domain/repositories/forum-member.repository.interface';
import type {
  ForumModerationLogDomain,
  ForumReportDomain,
  ReportTargetType,
} from '../../domain/entities/forum-report.domain';

@Injectable()
export class CreateReportUseCase {
  constructor(
    @Inject(FORUM_REPORT_REPOSITORY)
    private readonly reportRepo: IForumReportRepository,
  ) {}

  async execute(
    reporterId: string,
    targetType: ReportTargetType,
    targetId: string,
    reason: string,
    description?: string,
  ): Promise<ForumReportDomain> {
    const existing = await this.reportRepo.findByReporterAndTarget(
      reporterId,
      targetType,
      targetId,
    );
    if (existing) throw new ConflictException('Already reported this target');
    return this.reportRepo.create({
      reporterId,
      targetType,
      targetId,
      reason,
      description,
    });
  }
}

@Injectable()
export class GetForumReportsUseCase {
  constructor(
    @Inject(FORUM_REPORT_REPOSITORY)
    private readonly reportRepo: IForumReportRepository,
  ) {}

  execute(
    input: GetReportsInput,
  ): Promise<{ data: ForumReportDomain[]; total: number }> {
    return this.reportRepo.findByForum(input);
  }
}

@Injectable()
export class ResolveReportUseCase {
  constructor(
    @Inject(FORUM_REPORT_REPOSITORY)
    private readonly reportRepo: IForumReportRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
    @Inject(FORUM_MODERATION_LOG_REPOSITORY)
    private readonly modLogRepo: IForumModerationLogRepository,
  ) {}

  async execute(
    forumId: string,
    reportId: string,
    moderatorId: string,
    resolutionNote: string,
  ): Promise<ForumReportDomain> {
    const member = await this.memberRepo.findByForumAndUser(
      forumId,
      moderatorId,
    );
    if (!member || (member.role !== 'moderator' && member.role !== 'owner')) {
      throw new ForbiddenException('Only moderators can resolve reports');
    }
    const report = await this.reportRepo.findById(reportId);
    if (!report) throw new NotFoundException('Report not found');
    const updated = await this.reportRepo.updateStatus(
      reportId,
      'resolved',
      moderatorId,
      resolutionNote,
    );
    await this.modLogRepo.create({
      moderatorId,
      action: 'resolve_report',
      targetType: report.targetType,
      targetId: report.targetId,
      reasonText: resolutionNote,
      forumId,
    });
    return updated;
  }
}

@Injectable()
export class DismissReportUseCase {
  constructor(
    @Inject(FORUM_REPORT_REPOSITORY)
    private readonly reportRepo: IForumReportRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
  ) {}

  async execute(
    forumId: string,
    reportId: string,
    moderatorId: string,
    note?: string,
  ): Promise<ForumReportDomain> {
    const member = await this.memberRepo.findByForumAndUser(
      forumId,
      moderatorId,
    );
    if (!member || (member.role !== 'moderator' && member.role !== 'owner')) {
      throw new ForbiddenException('Only moderators can dismiss reports');
    }
    const report = await this.reportRepo.findById(reportId);
    if (!report) throw new NotFoundException('Report not found');
    return this.reportRepo.updateStatus(
      reportId,
      'dismissed',
      moderatorId,
      note,
    );
  }
}

@Injectable()
export class GetModerationLogsUseCase {
  constructor(
    @Inject(FORUM_MODERATION_LOG_REPOSITORY)
    private readonly modLogRepo: IForumModerationLogRepository,
  ) {}

  execute(
    forumId: string,
    page?: number,
    limit?: number,
  ): Promise<{ data: ForumModerationLogDomain[]; total: number }> {
    return this.modLogRepo.findByForum(forumId, page, limit);
  }
}
