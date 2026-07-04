import {
  Inject,
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  FORUM_POST_REPOSITORY,
  IForumPostRepository,
  type UpdatePostInput,
} from '../../domain/repositories/forum-post.repository.interface';
import {
  ICloudinaryService,
  CLOUDINARY_SERVICE,
} from '../interfaces/i-cloudinary.service';
import {
  FORUM_MENTION_REPOSITORY,
  IForumMentionRepository,
} from '../../domain/repositories/forum-notification.repository.interface';
import { NotificationService } from '../services/notification.service';
import type { ForumPostDomain } from '../../domain/entities/forum-post.domain';
import {
  validateTiptapDoc,
  extractCloudinaryUrls,
  extractPublicIdFromUrl,
  extractMentions,
} from '../helpers/extract-mentions';

@Injectable()
export class UpdatePostUseCase {
  constructor(
    @Inject(FORUM_POST_REPOSITORY)
    private readonly postRepo: IForumPostRepository,
    @Inject(CLOUDINARY_SERVICE)
    private readonly cloudinary: ICloudinaryService,
    @Inject(FORUM_MENTION_REPOSITORY)
    private readonly mentionRepo: IForumMentionRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(
    forumId: string,
    postId: string,
    input: UpdatePostInput,
    userId: string,
  ): Promise<ForumPostDomain> {
    const post = await this.postRepo.findByIdAndForum(postId, forumId);
    if (!post) throw new NotFoundException('Post not found');
    if (post.isLocked) throw new BadRequestException('Post is locked');

    if (post.authorId !== userId) {
      throw new ForbiddenException('Only the author can edit this post');
    }

    if (input.content) {
      const validation = validateTiptapDoc(input.content);
      if (!validation.ok) {
        throw new BadRequestException(
          `Invalid post content: ${validation.reason}`,
        );
      }
    }

    if (input.content && post.content) {
      const oldUrls = extractCloudinaryUrls(post.content);
      const newUrls = extractCloudinaryUrls(input.content);
      const removedUrls = oldUrls.filter((u) => !newUrls.includes(u));
      for (const url of removedUrls) {
        const publicId = extractPublicIdFromUrl(url);
        if (publicId) {
          this.cloudinary.deleteFile(publicId).catch(() => undefined);
        }
      }
    }

    const updated = await this.postRepo.update(postId, input);

    if (input.content) {
      const oldMentions = extractMentions(post.content);
      const newMentions = extractMentions(input.content).filter(
        (id) => id !== userId,
      );
      const added = newMentions.filter((id) => !oldMentions.includes(id));
      for (const mentionedUserId of added) {
        await this.mentionRepo.create({
          postId,
          mentionedUserId,
        });
        this.notificationService
          .sendNotification({
            recipientId: mentionedUserId,
            actorId: userId,
            type: 'mention',
            targetType: 'post',
            targetId: postId,
          })
          .catch(() => undefined);
      }
    }

    return updated;
  }
}
