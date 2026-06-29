import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ForumEntity } from './infrastructure/persistence/entities/forum.entity';
import { ForumCategoryEntity } from './infrastructure/persistence/entities/forum-category.entity';
import { ForumTagEntity } from './infrastructure/persistence/entities/forum-tag.entity';
import { ForumRuleEntity } from './infrastructure/persistence/entities/forum-rule.entity';
import { ForumMemberEntity } from './infrastructure/persistence/entities/forum-member.entity';
import { ForumInviteEntity } from './infrastructure/persistence/entities/forum-invite.entity';
import { ForumJoinRequestEntity } from './infrastructure/persistence/entities/forum-join-request.entity';
import { ForumPostEntity } from './infrastructure/persistence/entities/forum-post.entity';
import { ForumCommentEntity } from './infrastructure/persistence/entities/forum-comment.entity';
import { ForumPollEntity } from './infrastructure/persistence/entities/forum-poll.entity';
import { ForumPollOptionEntity } from './infrastructure/persistence/entities/forum-poll-option.entity';
import { ForumPollVoteEntity } from './infrastructure/persistence/entities/forum-poll-vote.entity';
import { ForumDraftEntity } from './infrastructure/persistence/entities/forum-draft.entity';
import { ForumPostAttachmentEntity } from './infrastructure/persistence/entities/forum-post-attachment.entity';
import { ForumReactionEntity } from './infrastructure/persistence/entities/forum-reaction.entity';
import { ForumBookmarkEntity } from './infrastructure/persistence/entities/forum-bookmark.entity';
import { ForumReportEntity } from './infrastructure/persistence/entities/forum-report.entity';
import { ForumModerationLogEntity } from './infrastructure/persistence/entities/forum-moderation-log.entity';
import { ForumNotificationEntity } from './infrastructure/persistence/entities/forum-notification.entity';
import { ForumMentionEntity } from './infrastructure/persistence/entities/forum-mention.entity';
import { ForumFollowEntity } from './infrastructure/persistence/entities/forum-follow.entity';

import { ForumRepository } from './infrastructure/persistence/repositories/forum.repository';
import { ForumMemberRepository } from './infrastructure/persistence/repositories/forum-member.repository';
import { ForumInviteRepository } from './infrastructure/persistence/repositories/forum-invite.repository';
import { ForumJoinRequestRepository } from './infrastructure/persistence/repositories/forum-join-request.repository';
import { ForumRuleRepository } from './infrastructure/persistence/repositories/forum-rule.repository';
import { ForumPostRepository } from './infrastructure/persistence/repositories/forum-post.repository';
import { ForumCommentRepository } from './infrastructure/persistence/repositories/forum-comment.repository';
import { ForumPollRepository } from './infrastructure/persistence/repositories/forum-poll.repository';
import { ForumDraftRepository } from './infrastructure/persistence/repositories/forum-draft.repository';
import { ForumPostAttachmentRepository } from './infrastructure/persistence/repositories/forum-post-attachment.repository';
import { ForumReactionRepository } from './infrastructure/persistence/repositories/forum-reaction.repository';
import { ForumBookmarkRepository } from './infrastructure/persistence/repositories/forum-bookmark.repository';
import { ForumReportRepository } from './infrastructure/persistence/repositories/forum-report.repository';
import { ForumModerationLogRepository } from './infrastructure/persistence/repositories/forum-moderation-log.repository';
import { ForumNotificationRepository } from './infrastructure/persistence/repositories/forum-notification.repository';
import { ForumMentionRepository } from './infrastructure/persistence/repositories/forum-mention.repository';
import { CloudinaryService } from './infrastructure/services/cloudinary.service';
import { ForumGateway } from './infrastructure/gateways/forum.gateway';
import { CLOUDINARY_SERVICE } from './application/interfaces/i-cloudinary.service';
import { FORUM_GATEWAY } from './application/interfaces/i-forum-gateway';
import { NotificationProcessor } from './infrastructure/queues/notification.processor';
import { ViewFlushProcessor } from './infrastructure/queues/view-flush.processor';
import { NotificationService } from './application/services/notification.service';
import {
  FORUM_QUEUE_NAME,
  FORUM_VIEWS_QUEUE_NAME,
} from './infrastructure/queues/queue-names';

import { FORUM_REPOSITORY } from './domain/repositories/forum.repository.interface';
import { FORUM_MEMBER_REPOSITORY } from './domain/repositories/forum-member.repository.interface';
import { FORUM_INVITE_REPOSITORY } from './domain/repositories/forum-invite.repository.interface';
import { FORUM_JOIN_REQUEST_REPOSITORY } from './domain/repositories/forum-join-request.repository.interface';
import { FORUM_RULE_REPOSITORY } from './domain/repositories/forum-rule.repository.interface';
import { FORUM_POST_REPOSITORY } from './domain/repositories/forum-post.repository.interface';
import { FORUM_COMMENT_REPOSITORY } from './domain/repositories/forum-comment.repository.interface';
import { FORUM_POLL_REPOSITORY } from './domain/repositories/forum-poll.repository.interface';
import {
  FORUM_DRAFT_REPOSITORY,
  FORUM_POST_ATTACHMENT_REPOSITORY,
} from './domain/repositories/forum-draft.repository.interface';
import { FORUM_REACTION_REPOSITORY } from './domain/repositories/forum-reaction.repository.interface';
import { FORUM_BOOKMARK_REPOSITORY } from './domain/repositories/forum-bookmark.repository.interface';
import {
  FORUM_REPORT_REPOSITORY,
  FORUM_MODERATION_LOG_REPOSITORY,
} from './domain/repositories/forum-report.repository.interface';
import {
  FORUM_NOTIFICATION_REPOSITORY,
  FORUM_MENTION_REPOSITORY,
} from './domain/repositories/forum-notification.repository.interface';

import { CreateForumUseCase } from './application/use-cases/create-forum.use-case';
import { GetForumListUseCase } from './application/use-cases/get-forum-list.use-case';
import { GetForumDetailUseCase } from './application/use-cases/get-forum-detail.use-case';
import { UpdateForumUseCase } from './application/use-cases/update-forum.use-case';
import { DeleteForumUseCase } from './application/use-cases/delete-forum.use-case';
import { SetForumRulesUseCase } from './application/use-cases/set-forum-rules.use-case';
import { JoinForumUseCase } from './application/use-cases/join-forum.use-case';
import { LeaveForumUseCase } from './application/use-cases/leave-forum.use-case';
import { GetForumMembersUseCase } from './application/use-cases/get-forum-members.use-case';
import { UpdateMemberRoleUseCase } from './application/use-cases/update-member-role.use-case';
import { RemoveMemberUseCase } from './application/use-cases/remove-member.use-case';
import { GetJoinRequestsUseCase } from './application/use-cases/get-join-requests.use-case';
import { ApproveJoinRequestUseCase } from './application/use-cases/approve-join-request.use-case';
import { RejectJoinRequestUseCase } from './application/use-cases/reject-join-request.use-case';
import { CreateInviteUseCase } from './application/use-cases/create-invite.use-case';
import { AcceptInviteUseCase } from './application/use-cases/accept-invite.use-case';
import { GetInvitesUseCase } from './application/use-cases/get-invites.use-case';
import { RevokeInviteUseCase } from './application/use-cases/revoke-invite.use-case';
import { CreatePostUseCase } from './application/use-cases/create-post.use-case';
import { GetPostsUseCase } from './application/use-cases/get-posts.use-case';
import { GetPostDetailUseCase } from './application/use-cases/get-post-detail.use-case';
import { UpdatePostUseCase } from './application/use-cases/update-post.use-case';
import { DeletePostUseCase } from './application/use-cases/delete-post.use-case';
import { PinPostUseCase } from './application/use-cases/pin-post.use-case';
import { LockPostUseCase } from './application/use-cases/lock-post.use-case';
import { CreateCommentUseCase } from './application/use-cases/create-comment.use-case';
import { GetCommentsUseCase } from './application/use-cases/get-comments.use-case';
import { UpdateCommentUseCase } from './application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.use-case';
import { VotePollUseCase } from './application/use-cases/vote-poll.use-case';
import { RemovePollVoteUseCase } from './application/use-cases/remove-poll-vote.use-case';
import { SaveDraftUseCase } from './application/use-cases/save-draft.use-case';
import { ListMyDraftsUseCase } from './application/use-cases/list-my-drafts.use-case';
import { PublishDraftUseCase } from './application/use-cases/publish-draft.use-case';
import { DeleteDraftUseCase } from './application/use-cases/delete-draft.use-case';
import { UploadAttachmentUseCase } from './application/use-cases/upload-attachment.use-case';
import { UploadForumImageUseCase } from './application/use-cases/upload-forum-image.use-case';
import { ToggleReactionUseCase } from './application/use-cases/toggle-reaction.use-case';
import { SearchForumUseCase } from './application/use-cases/search-forum.use-case';
import { ToggleBookmarkUseCase } from './application/use-cases/toggle-bookmark.use-case';
import {
  CountUnreadNotificationsUseCase,
  GetMyNotificationsUseCase,
  MarkAllNotificationsReadUseCase,
  MarkNotificationReadUseCase,
} from './application/use-cases/forum-notification.use-case';
import { GetBookmarksUseCase } from './application/use-cases/get-bookmarks.use-case';
import {
  HideCommentUseCase,
  HidePostUseCase,
  RestoreCommentUseCase,
  RestorePostUseCase,
} from './application/use-cases/moderation.use-case';
import {
  CreateReportUseCase,
  DismissReportUseCase,
  GetForumReportsUseCase,
  GetModerationLogsUseCase,
  ResolveReportUseCase,
} from './application/use-cases/forum-report.use-case';

import { ForumController } from './presentation/controllers/forum.controller';
import { ForumMembershipController } from './presentation/controllers/forum-membership.controller';
import { ForumPostController } from './presentation/controllers/forum-post.controller';
import { ForumCommentController } from './presentation/controllers/forum-comment.controller';
import { ForumPollController } from './presentation/controllers/forum-poll.controller';
import { ForumDraftController } from './presentation/controllers/forum-draft.controller';
import { ForumUploadController } from './presentation/controllers/forum-upload.controller';
import { ForumInteractionController } from './presentation/controllers/forum-interaction.controller';
import { ForumModerationController } from './presentation/controllers/forum-moderation.controller';
import { ForumSearchController } from './presentation/controllers/forum-search.controller';
import { ForumNotificationController } from './presentation/controllers/forum-notification.controller';

const entities = [
  ForumEntity,
  ForumCategoryEntity,
  ForumTagEntity,
  ForumRuleEntity,
  ForumMemberEntity,
  ForumInviteEntity,
  ForumJoinRequestEntity,
  ForumPostEntity,
  ForumCommentEntity,
  ForumPollEntity,
  ForumPollOptionEntity,
  ForumPollVoteEntity,
  ForumDraftEntity,
  ForumPostAttachmentEntity,
  ForumReactionEntity,
  ForumBookmarkEntity,
  ForumReportEntity,
  ForumModerationLogEntity,
  ForumNotificationEntity,
  ForumMentionEntity,
  ForumFollowEntity,
];

const repositoryProviders = [
  { provide: FORUM_REPOSITORY, useClass: ForumRepository },
  { provide: FORUM_MEMBER_REPOSITORY, useClass: ForumMemberRepository },
  { provide: FORUM_INVITE_REPOSITORY, useClass: ForumInviteRepository },
  {
    provide: FORUM_JOIN_REQUEST_REPOSITORY,
    useClass: ForumJoinRequestRepository,
  },
  { provide: FORUM_RULE_REPOSITORY, useClass: ForumRuleRepository },
  { provide: FORUM_POST_REPOSITORY, useClass: ForumPostRepository },
  { provide: FORUM_COMMENT_REPOSITORY, useClass: ForumCommentRepository },
  { provide: FORUM_POLL_REPOSITORY, useClass: ForumPollRepository },
  { provide: FORUM_DRAFT_REPOSITORY, useClass: ForumDraftRepository },
  {
    provide: FORUM_POST_ATTACHMENT_REPOSITORY,
    useClass: ForumPostAttachmentRepository,
  },
  { provide: FORUM_REACTION_REPOSITORY, useClass: ForumReactionRepository },
  { provide: FORUM_BOOKMARK_REPOSITORY, useClass: ForumBookmarkRepository },
  { provide: FORUM_REPORT_REPOSITORY, useClass: ForumReportRepository },
  {
    provide: FORUM_MODERATION_LOG_REPOSITORY,
    useClass: ForumModerationLogRepository,
  },
  {
    provide: FORUM_NOTIFICATION_REPOSITORY,
    useClass: ForumNotificationRepository,
  },
  { provide: FORUM_MENTION_REPOSITORY, useClass: ForumMentionRepository },
  { provide: CLOUDINARY_SERVICE, useClass: CloudinaryService },
  { provide: FORUM_GATEWAY, useClass: ForumGateway },
];

const useCases = [
  CreateForumUseCase,
  GetForumListUseCase,
  GetForumDetailUseCase,
  UpdateForumUseCase,
  DeleteForumUseCase,
  SetForumRulesUseCase,
  JoinForumUseCase,
  LeaveForumUseCase,
  GetForumMembersUseCase,
  UpdateMemberRoleUseCase,
  RemoveMemberUseCase,
  GetJoinRequestsUseCase,
  ApproveJoinRequestUseCase,
  RejectJoinRequestUseCase,
  CreateInviteUseCase,
  AcceptInviteUseCase,
  GetInvitesUseCase,
  RevokeInviteUseCase,
  CreatePostUseCase,
  GetPostsUseCase,
  GetPostDetailUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  PinPostUseCase,
  LockPostUseCase,
  CreateCommentUseCase,
  GetCommentsUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  VotePollUseCase,
  RemovePollVoteUseCase,
  SaveDraftUseCase,
  ListMyDraftsUseCase,
  PublishDraftUseCase,
  DeleteDraftUseCase,
  UploadAttachmentUseCase,
  UploadForumImageUseCase,
  ToggleReactionUseCase,
  ToggleBookmarkUseCase,
  GetBookmarksUseCase,
  HidePostUseCase,
  RestorePostUseCase,
  HideCommentUseCase,
  RestoreCommentUseCase,
  CreateReportUseCase,
  GetForumReportsUseCase,
  ResolveReportUseCase,
  DismissReportUseCase,
  GetModerationLogsUseCase,
  SearchForumUseCase,
  GetMyNotificationsUseCase,
  MarkNotificationReadUseCase,
  MarkAllNotificationsReadUseCase,
  CountUnreadNotificationsUseCase,
  NotificationService,
  NotificationProcessor,
  ViewFlushProcessor,
];

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    BullModule.registerQueue(
      { name: FORUM_QUEUE_NAME },
      { name: FORUM_VIEWS_QUEUE_NAME },
    ),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    ForumController,
    ForumMembershipController,
    ForumPostController,
    ForumCommentController,
    ForumPollController,
    ForumDraftController,
    ForumUploadController,
    ForumInteractionController,
    ForumModerationController,
    ForumSearchController,
    ForumNotificationController,
  ],
  providers: [...useCases, ...repositoryProviders],
  exports: [],
})
export class ForumModule {}
