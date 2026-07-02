import {
  Inject,
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  FORUM_REPORT_REPOSITORY,
  IForumReportRepository,
  type GetReportsInput,
} from '../../domain/repositories/forum-report.repository.interface';
import {
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
} from '../../domain/repositories/forum-member.repository.interface';
import {
  FORUM_POST_REPOSITORY,
  IForumPostRepository,
} from '../../domain/repositories/forum-post.repository.interface';
import {
  FORUM_COMMENT_REPOSITORY,
  IForumCommentRepository,
} from '../../domain/repositories/forum-comment.repository.interface';
import { FORUM_GATEWAY, IForumGateway } from '../interfaces/i-forum-gateway';
import type {
  ForumReportDomain,
  ReportTargetType,
} from '../../domain/entities/forum-report.domain';

@Injectable()
export class CreateReportUseCase {
  constructor(
    @Inject(FORUM_REPORT_REPOSITORY)
    private readonly reportRepo: IForumReportRepository,
    @Inject(FORUM_POST_REPOSITORY)
    private readonly postRepo: IForumPostRepository,
    @Inject(FORUM_COMMENT_REPOSITORY)
    private readonly commentRepo: IForumCommentRepository,
    @Inject(FORUM_GATEWAY)
    private readonly gateway: IForumGateway,
  ) {}

  async execute(
    reporterId: string,
    targetType: ReportTargetType,
    targetId: string,
    reason: string,
    description?: string,
  ): Promise<ForumReportDomain> {
    if (targetType === 'post') {
      const post = await this.postRepo.findById(targetId);
      if (post?.authorId === reporterId) {
        throw new ForbiddenException('Cannot report your own post');
      }
    } else if (targetType === 'comment') {
      const comment = await this.commentRepo.findById(targetId);
      if (comment?.authorId === reporterId) {
        throw new ForbiddenException('Cannot report your own comment');
      }
    }

    const existing = await this.reportRepo.findByReporterAndTarget(
      reporterId,
      targetType,
      targetId,
    );
    if (existing) throw new ConflictException('Already reported this target');
    const report = await this.reportRepo.create({
      reporterId,
      targetType,
      targetId,
      reason,
      description,
    });

    this.emitReportCreated(targetType, report).catch(() => {});

    return report;
  }

  private async emitReportCreated(
    targetType: string,
    report: ForumReportDomain,
  ): Promise<void> {
    if (targetType !== 'post') return;

    const result = await this.reportRepo.findAllWithDetails({
      limit: 1,
    });
    const detail = result.data.find((r) => r.id === report.id);
    this.gateway.emitReportCreated({
      id: report.id,
      reason: report.reason,
      description: report.description,
      targetType: report.targetType,
      targetId: report.targetId,
      reporterId: report.reporterId,
      createdAt: report.createdAt,
      reporterName: detail?.reporterName ?? 'Unknown',
      postTitle: detail?.postTitle ?? null,
      postStatus: detail?.postStatus,
      forumId: detail?.forumId ?? null,
      forumSlug: detail?.forumSlug ?? null,
      forumName: detail?.forumName ?? null,
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
    return this.reportRepo.updateStatus(
      reportId,
      'resolved',
      moderatorId,
      resolutionNote,
    );
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
export class GetPostReportsUseCase {
  constructor(
    @Inject(FORUM_REPORT_REPOSITORY)
    private readonly reportRepo: IForumReportRepository,
    @Inject(FORUM_POST_REPOSITORY)
    private readonly postRepo: IForumPostRepository,
  ) {}

  async execute(forumId: string, postId: string): Promise<ForumReportDomain[]> {
    const post = await this.postRepo.findById(postId);
    if (!post || post.forumId !== forumId) {
      throw new NotFoundException('Post not found');
    }

    return this.reportRepo.findByTarget({
      targetType: 'post',
      targetId: postId,
    });
  }
}
