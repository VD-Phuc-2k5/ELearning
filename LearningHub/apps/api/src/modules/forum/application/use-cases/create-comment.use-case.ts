import {
  Inject,
  Injectable,
  BadRequestException,
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
  FORUM_MENTION_REPOSITORY,
  IForumMentionRepository,
} from '../../domain/repositories/forum-notification.repository.interface';
import {
  FORUM_REPOSITORY,
  IForumRepository,
} from '../../domain/repositories/forum.repository.interface';
import { FORUM_GATEWAY, IForumGateway } from '../interfaces/i-forum-gateway';
import { NotificationService } from '../services/notification.service';
import type { IUserRoleRepository } from '../../../auth/domain/repositories/i-user-role.repository';
import { ForumCommentDomain } from '../../domain/entities/forum-comment.domain';

const MAX_COMMENT_DEPTH = 2;
const ADMIN_ROLES = new Set(['ADMIN', 'OWNER']);

@Injectable()
export class CreateCommentUseCase {
  constructor(
    @Inject(FORUM_POST_REPOSITORY)
    private readonly postRepo: IForumPostRepository,
    @Inject(FORUM_COMMENT_REPOSITORY)
    private readonly commentRepo: IForumCommentRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
    @Inject(FORUM_MENTION_REPOSITORY)
    private readonly mentionRepo: IForumMentionRepository,
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
    @Inject(FORUM_GATEWAY)
    private readonly gateway: IForumGateway,
    private readonly notificationService: NotificationService,
    @Inject('IUserRoleRepository')
    private readonly userRoleRepo: IUserRoleRepository,
  ) {}

  async execute(
    forumId: string,
    postId: string,
    content: string,
    parentId: string | undefined,
    mentionIds: string[] | undefined,
    authorId: string,
  ): Promise<ForumCommentDomain> {
    const post = await this.postRepo.findByIdAndForum(postId, forumId);
    if (!post) throw new NotFoundException('Post not found');
    if (post.isLocked) throw new BadRequestException('Post is locked');

    const forum = await this.forumRepo.findById(forumId);
    const forumSlug = forum?.slug ?? forumId;

    const member = await this.memberRepo.findByForumAndUser(forumId, authorId);
    if (!member) {
      const roles = await this.userRoleRepo.findByUserId(authorId);
      const isAdmin = roles.some((r) => ADMIN_ROLES.has(r.role.code));
      if (!isAdmin)
        throw new BadRequestException('Only forum members can comment');
    }

    let depth = 0;
    let parentComment: ForumCommentDomain | null = null;
    if (parentId) {
      parentComment = await this.commentRepo.findByIdAndPost(parentId, postId);
      if (!parentComment)
        throw new NotFoundException('Parent comment not found');
      if (parentComment.depth >= MAX_COMMENT_DEPTH) {
        throw new BadRequestException('Maximum comment depth reached');
      }
      depth = parentComment.depth + 1;
      await this.commentRepo.incrementReplyCount(parentId, 1);
    }

    const comment = await this.commentRepo.create({
      postId,
      authorId,
      parentId,
      depth,
      content,
    });
    await this.postRepo.incrementCommentCount(postId, 1);
    this.gateway.emitCommentNew(forumId, postId, comment);

    if (parentComment && parentComment.authorId !== authorId) {
      this.notificationService
        .sendNotification({
          recipientId: parentComment.authorId,
          actorId: authorId,
          type: 'reply',
          targetType: 'comment',
          targetId: comment.id,
          metadata: { postId, forumId, forumSlug },
        })
        .catch(() => undefined);
    }
    if (post.authorId !== authorId) {
      this.notificationService
        .sendNotification({
          recipientId: post.authorId,
          actorId: authorId,
          type: 'comment',
          targetType: 'post',
          targetId: postId,
          metadata: { postId, forumId, forumSlug },
        })
        .catch(() => undefined);
    }

    if (mentionIds && mentionIds.length > 0) {
      const uniqueMentionIds = [
        ...new Set(mentionIds.filter((id) => id !== authorId)),
      ];
      for (const mentionedUserId of uniqueMentionIds) {
        await this.mentionRepo.create({
          commentId: comment.id,
          mentionedUserId,
        });
        this.notificationService
          .sendNotification({
            recipientId: mentionedUserId,
            actorId: authorId,
            type: 'mention',
            targetType: 'comment',
            targetId: comment.id,
            metadata: { postId, forumId, forumSlug },
          })
          .catch(() => undefined);
      }
    }

    return comment;
  }
}
