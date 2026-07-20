import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import {
  FORUM_REACTION_REPOSITORY,
  IForumReactionRepository,
} from '../../domain/repositories/forum-reaction.repository.interface';
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
import { FORUM_GATEWAY, IForumGateway } from '../interfaces/i-forum-gateway';
import { NotificationService } from '../services/notification.service';
import { isAllowedEmoji } from '../../domain/constants/allowed-emojis';
import type { ReactionTargetType } from '../../domain/entities/forum-reaction.domain';

export interface ToggleReactionResult {
  active: boolean;
  emoji: string | null;
}

@Injectable()
export class ToggleReactionUseCase {
  private readonly logger = new Logger(ToggleReactionUseCase.name);

  constructor(
    @Inject(FORUM_REACTION_REPOSITORY)
    private readonly reactionRepo: IForumReactionRepository,
    @Inject(FORUM_POST_REPOSITORY)
    private readonly postRepo: IForumPostRepository,
    @Inject(FORUM_COMMENT_REPOSITORY)
    private readonly commentRepo: IForumCommentRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
    @Inject(FORUM_GATEWAY)
    private readonly gateway: IForumGateway,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(
    forumId: string,
    targetType: ReactionTargetType,
    targetId: string,
    userId: string,
    emoji: string,
    add: boolean,
  ): Promise<ToggleReactionResult> {
    if (!isAllowedEmoji(emoji)) {
      throw new BadRequestException('Emoji not allowed');
    }
    const member = await this.memberRepo.findByForumAndUser(forumId, userId);
    if (!member) throw new BadRequestException('Only forum members can react');

    let postId: string;
    let contentAuthorId: string;
    if (targetType === 'post') {
      const post = await this.postRepo.findByIdAndForum(targetId, forumId);
      if (!post) throw new NotFoundException('Post not found');
      postId = targetId;
      contentAuthorId = post.authorId;
    } else {
      const comment = await this.commentRepo.findById(targetId);
      if (!comment) throw new NotFoundException('Comment not found');
      postId = comment.postId;
      contentAuthorId = comment.authorId;
    }

    const existing = await this.reactionRepo.findByTargetAndUser(
      targetType,
      targetId,
      userId,
    );

    if (!add) {
      if (!existing) return { active: false, emoji: null };
      await this.reactionRepo.delete(existing.id);
      if (targetType === 'post') {
        await this.postRepo.incrementReactionCount(targetId, -1);
      } else {
        await this.commentRepo.incrementReactionCount(targetId, -1);
      }
      this.gateway.emitReactionUpdate(forumId, postId, {
        targetType,
        targetId,
      });
      return { active: false, emoji: null };
    }

    if (existing) {
      if (existing.emoji === emoji) {
        return { active: true, emoji: existing.emoji };
      }
      await this.reactionRepo.delete(existing.id);
      if (targetType === 'post') {
        await this.postRepo.incrementReactionCount(targetId, -1);
      } else {
        await this.commentRepo.incrementReactionCount(targetId, -1);
      }
    }
    await this.reactionRepo.create(targetType, targetId, userId, emoji);
    if (targetType === 'post') {
      await this.postRepo.incrementReactionCount(targetId, 1);
    } else {
      await this.commentRepo.incrementReactionCount(targetId, 1);
    }
    this.gateway.emitReactionUpdate(forumId, postId, { targetType, targetId });
    if (contentAuthorId !== userId) {
      this.notificationService
        .sendNotification({
          recipientId: contentAuthorId,
          actorId: userId,
          type: 'reaction',
          targetType,
          targetId,
        })
        .catch((err) => {
          this.logger.error(
            'Failed to send reaction notification',
            (err as Error).stack,
          );
        });
    }
    return { active: true, emoji };
  }
}
