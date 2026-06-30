import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  FORUM_POST_REPOSITORY,
  IForumPostRepository,
} from '../../domain/repositories/forum-post.repository.interface';
import {
  FORUM_COMMENT_REPOSITORY,
  IForumCommentRepository,
} from '../../domain/repositories/forum-comment.repository.interface';
import {
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
} from '../../domain/repositories/forum-member.repository.interface';
import {
  FORUM_MODERATION_LOG_REPOSITORY,
  IForumModerationLogRepository,
} from '../../domain/repositories/forum-report.repository.interface';
import {
  FORUM_REPOSITORY,
  IForumRepository,
} from '../../domain/repositories/forum.repository.interface';
import type { ForumModerationLogDomain } from '../../domain/entities/forum-report.domain';

@Injectable()
export class HidePostUseCase {
  constructor(
    @Inject(FORUM_POST_REPOSITORY)
    private readonly postRepo: IForumPostRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
    @Inject(FORUM_MODERATION_LOG_REPOSITORY)
    private readonly modLogRepo: IForumModerationLogRepository,
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
  ) {}

  async execute(
    forumId: string,
    postId: string,
    moderatorId: string,
    reasonCode: string,
    reasonText?: string,
  ): Promise<ForumModerationLogDomain> {
    const post = await this.postRepo.findByIdAndForum(postId, forumId);
    if (!post) throw new NotFoundException('Post not found');

    const member = await this.memberRepo.findByForumAndUser(
      forumId,
      moderatorId,
    );
    if (!member || (member.role !== 'moderator' && member.role !== 'owner')) {
      throw new ForbiddenException('Only moderators can hide posts');
    }
    await this.postRepo.updateStatus(postId, 'hidden');
    if (post.status === 'published') {
      await this.forumRepo.incrementPostCount(forumId, -1);
    }
    return this.modLogRepo.create({
      moderatorId,
      action: 'hide_post',
      targetType: 'post',
      targetId: postId,
      reasonCode,
      reasonText,
      forumId,
    });
  }
}

@Injectable()
export class RestorePostUseCase {
  constructor(
    @Inject(FORUM_POST_REPOSITORY)
    private readonly postRepo: IForumPostRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
    @Inject(FORUM_MODERATION_LOG_REPOSITORY)
    private readonly modLogRepo: IForumModerationLogRepository,
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
  ) {}

  async execute(
    forumId: string,
    postId: string,
    moderatorId: string,
  ): Promise<ForumModerationLogDomain> {
    const post = await this.postRepo.findByIdAndForum(postId, forumId);
    if (!post) throw new NotFoundException('Post not found');

    const member = await this.memberRepo.findByForumAndUser(
      forumId,
      moderatorId,
    );
    if (!member || (member.role !== 'moderator' && member.role !== 'owner')) {
      throw new ForbiddenException('Only moderators can restore posts');
    }
    await this.postRepo.updateStatus(postId, 'published');
    if (post.status === 'hidden') {
      await this.forumRepo.incrementPostCount(forumId, 1);
    }
    return this.modLogRepo.create({
      moderatorId,
      action: 'restore_post',
      targetType: 'post',
      targetId: postId,
      forumId,
    });
  }
}

@Injectable()
export class HideCommentUseCase {
  constructor(
    @Inject(FORUM_COMMENT_REPOSITORY)
    private readonly commentRepo: IForumCommentRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
    @Inject(FORUM_MODERATION_LOG_REPOSITORY)
    private readonly modLogRepo: IForumModerationLogRepository,
  ) {}

  async execute(
    forumId: string,
    commentId: string,
    moderatorId: string,
    reasonCode: string,
    reasonText?: string,
  ): Promise<ForumModerationLogDomain> {
    const member = await this.memberRepo.findByForumAndUser(
      forumId,
      moderatorId,
    );
    if (!member || (member.role !== 'moderator' && member.role !== 'owner')) {
      throw new ForbiddenException('Only moderators can hide comments');
    }
    await this.commentRepo.updateStatus(commentId, 'hidden');
    return this.modLogRepo.create({
      moderatorId,
      action: 'hide_comment',
      targetType: 'comment',
      targetId: commentId,
      reasonCode,
      reasonText,
      forumId,
    });
  }
}

@Injectable()
export class RestoreCommentUseCase {
  constructor(
    @Inject(FORUM_COMMENT_REPOSITORY)
    private readonly commentRepo: IForumCommentRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
    @Inject(FORUM_MODERATION_LOG_REPOSITORY)
    private readonly modLogRepo: IForumModerationLogRepository,
  ) {}

  async execute(
    forumId: string,
    commentId: string,
    moderatorId: string,
  ): Promise<ForumModerationLogDomain> {
    const member = await this.memberRepo.findByForumAndUser(
      forumId,
      moderatorId,
    );
    if (!member || (member.role !== 'moderator' && member.role !== 'owner')) {
      throw new ForbiddenException('Only moderators can restore comments');
    }
    await this.commentRepo.updateStatus(commentId, 'published');
    return this.modLogRepo.create({
      moderatorId,
      action: 'restore_comment',
      targetType: 'comment',
      targetId: commentId,
      forumId,
    });
  }
}
