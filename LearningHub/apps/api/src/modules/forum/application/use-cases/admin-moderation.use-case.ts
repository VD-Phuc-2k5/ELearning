import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import {
  FORUM_REPORT_REPOSITORY,
  IForumReportRepository,
  FindAllWithDetailsInput,
} from '../../domain/repositories/forum-report.repository.interface';
import type {
  AdminReportDetail,
  ForumReportDomain,
} from '../../domain/entities/forum-report.domain';
import {
  FORUM_POST_REPOSITORY,
  IForumPostRepository,
} from '../../domain/repositories/forum-post.repository.interface';
import {
  FORUM_REPOSITORY,
  IForumRepository,
} from '../../domain/repositories/forum.repository.interface';
import { FORUM_GATEWAY, IForumGateway } from '../interfaces/i-forum-gateway';
import { NotificationService } from '../services/notification.service';
import type { IUserRoleRepository } from '../../../auth/domain/repositories/i-user-role.repository';

async function checkAdmin(
  userRoleRepo: IUserRoleRepository,
  userId: string,
): Promise<void> {
  const userRoles = await userRoleRepo.findByUserId(userId);
  const isAdmin = userRoles.some(
    (ur) => ur.role.code === 'ADMIN' || ur.role.code === 'OWNER',
  );
  if (!isAdmin)
    throw new ForbiddenException('Only admins can perform this action');
}

@Injectable()
export class AdminGetAllReportsUseCase {
  constructor(
    @Inject(FORUM_REPORT_REPOSITORY)
    private readonly reportRepo: IForumReportRepository,
    @Inject('IUserRoleRepository')
    private readonly userRoleRepo: IUserRoleRepository,
  ) {}

  async execute(
    userId: string,
    input: FindAllWithDetailsInput,
  ): Promise<{ data: AdminReportDetail[]; total: number }> {
    await checkAdmin(this.userRoleRepo, userId);
    return this.reportRepo.findAllWithDetails(input);
  }
}

@Injectable()
export class AdminResolveReportUseCase {
  constructor(
    @Inject(FORUM_REPORT_REPOSITORY)
    private readonly reportRepo: IForumReportRepository,
    @Inject('IUserRoleRepository')
    private readonly userRoleRepo: IUserRoleRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(
    userId: string,
    reportId: string,
    resolutionNote: string,
  ): Promise<ForumReportDomain> {
    await checkAdmin(this.userRoleRepo, userId);

    const report = await this.reportRepo.findById(reportId);
    if (!report) throw new NotFoundException('Report not found');

    const resolved = await this.reportRepo.updateStatus(
      reportId,
      'resolved',
      userId,
      resolutionNote,
    );

    this.notificationService
      .sendNotification({
        recipientId: resolved.reporterId,
        actorId: userId,
        type: 'report_resolved',
        targetType: resolved.targetType,
        targetId: resolved.targetId,
        metadata: { note: resolutionNote, reason: resolved.reason },
      })
      .catch(() => undefined);

    return resolved;
  }
}

@Injectable()
export class AdminDismissReportUseCase {
  private readonly logger = new Logger(AdminDismissReportUseCase.name);

  constructor(
    @Inject(FORUM_REPORT_REPOSITORY)
    private readonly reportRepo: IForumReportRepository,
    @Inject('IUserRoleRepository')
    private readonly userRoleRepo: IUserRoleRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(
    userId: string,
    reportId: string,
    note?: string,
  ): Promise<ForumReportDomain> {
    await checkAdmin(this.userRoleRepo, userId);

    const report = await this.reportRepo.findById(reportId);
    if (!report) throw new NotFoundException('Report not found');

    const dismissed = await this.reportRepo.updateStatus(
      reportId,
      'dismissed',
      userId,
      note,
    );

    this.notificationService
      .sendNotification({
        recipientId: dismissed.reporterId,
        actorId: userId,
        type: 'report_dismissed',
        targetType: dismissed.targetType,
        targetId: dismissed.targetId,
        metadata: { note, reason: dismissed.reason },
      })
      .catch((err) => {
        this.logger.error(
          'Failed to send report dismissed notification',
          (err as Error).stack,
        );
      });

    return dismissed;
  }
}

@Injectable()
export class AdminHidePostUseCase {
  constructor(
    @Inject(FORUM_POST_REPOSITORY)
    private readonly postRepo: IForumPostRepository,
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
    @Inject('IUserRoleRepository')
    private readonly userRoleRepo: IUserRoleRepository,
    @Inject(FORUM_GATEWAY)
    private readonly gateway: IForumGateway,
  ) {}

  async execute(
    userId: string,
    postId: string,
    reasonCode: string,
    reasonText?: string,
  ): Promise<void> {
    void reasonCode;
    void reasonText;
    await checkAdmin(this.userRoleRepo, userId);

    const post = await this.postRepo.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    await this.postRepo.updateStatus(postId, 'hidden');
    if (post.status === 'published') {
      await this.forumRepo.incrementPostCount(post.forumId, -1);
    }

    this.gateway.emitPostHidden(post.forumId, {
      postId,
      forumId: post.forumId,
    });
  }
}

@Injectable()
export class AdminRestorePostUseCase {
  constructor(
    @Inject(FORUM_POST_REPOSITORY)
    private readonly postRepo: IForumPostRepository,
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
    @Inject('IUserRoleRepository')
    private readonly userRoleRepo: IUserRoleRepository,
    @Inject(FORUM_GATEWAY)
    private readonly gateway: IForumGateway,
  ) {}

  async execute(userId: string, postId: string): Promise<void> {
    await checkAdmin(this.userRoleRepo, userId);

    const post = await this.postRepo.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    await this.postRepo.updateStatus(postId, 'published');
    if (post.status === 'hidden') {
      await this.forumRepo.incrementPostCount(post.forumId, 1);
    }

    this.gateway.emitPostRestored(post.forumId, {
      postId,
      forumId: post.forumId,
    });
  }
}
