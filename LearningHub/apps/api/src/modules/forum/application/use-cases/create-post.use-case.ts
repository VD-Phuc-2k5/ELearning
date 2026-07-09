import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import {
  FORUM_REPOSITORY,
  IForumRepository,
} from '../../domain/repositories/forum.repository.interface';
import {
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
} from '../../domain/repositories/forum-member.repository.interface';
import {
  FORUM_MENTION_REPOSITORY,
  IForumMentionRepository,
} from '../../domain/repositories/forum-notification.repository.interface';
import {
  FORUM_POST_REPOSITORY,
  IForumPostRepository,
} from '../../domain/repositories/forum-post.repository.interface';
import {
  FORUM_POLL_REPOSITORY,
  IForumPollRepository,
} from '../../domain/repositories/forum-poll.repository.interface';
import { FORUM_GATEWAY, IForumGateway } from '../interfaces/i-forum-gateway';
import { NotificationService } from '../services/notification.service';
import type { IUserRoleRepository } from '../../../auth/domain/repositories/i-user-role.repository';
import type {
  ForumPostDomain,
  PostType,
} from '../../domain/entities/forum-post.domain';
import {
  validateTiptapDoc,
  extractMentions,
} from '../helpers/extract-mentions';

const ADMIN_ROLES = new Set(['ADMIN', 'OWNER']);

export interface CreatePostParams {
  title: string;
  content?: Record<string, unknown>;
  postType?: PostType;
  tagIds?: number[];
  poll?: {
    question: string;
    options: Array<{ text: string }>;
    endsAt?: Date;
    isMultipleChoice?: boolean;
  };
  roadmapId?: string;
  questionBankId?: string;
}

@Injectable()
export class CreatePostUseCase {
  private readonly logger = new Logger(CreatePostUseCase.name);

  constructor(
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
    @Inject(FORUM_POST_REPOSITORY)
    private readonly postRepo: IForumPostRepository,
    @Inject(FORUM_POLL_REPOSITORY)
    private readonly pollRepo: IForumPollRepository,
    @Inject(FORUM_GATEWAY)
    private readonly gateway: IForumGateway,
    @Inject(FORUM_MENTION_REPOSITORY)
    private readonly mentionRepo: IForumMentionRepository,
    private readonly notificationService: NotificationService,
    @Inject('IUserRoleRepository')
    private readonly userRoleRepo: IUserRoleRepository,
  ) {}

  async execute(
    forumId: string,
    params: CreatePostParams,
    authorId: string,
  ): Promise<ForumPostDomain> {
    if (params.content) {
      const validation = validateTiptapDoc(params.content);
      if (!validation.ok) {
        throw new BadRequestException(
          `Invalid post content: ${validation.reason}`,
        );
      }
    }
    const forum = await this.forumRepo.findById(forumId);
    if (!forum) throw new NotFoundException('Forum not found');
    if (forum.isLocked) throw new BadRequestException('Forum is locked');

    const member = await this.memberRepo.findByForumAndUser(forumId, authorId);
    if (!member) {
      const roles = await this.userRoleRepo.findByUserId(authorId);
      const isAdmin = roles.some((r) => ADMIN_ROLES.has(r.role.code));
      if (!isAdmin) {
        throw new BadRequestException('Only forum members can create posts');
      }
    }

    const postType = params.postType ?? 'text';
    const post = await this.postRepo.create({
      forumId,
      authorId,
      title: params.title,
      content: params.content,
      postType: postType,
      status: 'published',
      tagIds: params.tagIds,
      roadmapId: params.roadmapId,
      questionBankId: params.questionBankId,
    });

    if (postType === 'poll' && params.poll) {
      await this.pollRepo.create({
        postId: post.id,
        question: params.poll.question,
        endsAt: params.poll.endsAt,
        isMultipleChoice: params.poll.isMultipleChoice,
        options: params.poll.options,
      });
    }

    await this.forumRepo.incrementPostCount(forumId, 1);
    this.gateway.emitPostNew(forumId, { postId: post.id });

    if (params.content) {
      const mentionedIds = extractMentions(params.content).filter(
        (id) => id !== authorId,
      );
      for (const mentionedUserId of mentionedIds) {
        await this.mentionRepo.create({
          postId: post.id,
          mentionedUserId,
        });
        this.notificationService
          .sendNotification({
            recipientId: mentionedUserId,
            actorId: authorId,
            type: 'mention',
            targetType: 'post',
            targetId: post.id,
          })
          .catch((err) => {
            this.logger.error(
              'Failed to send mention notification',
              (err as Error).stack,
            );
          });
      }
    }

    return post;
  }
}
