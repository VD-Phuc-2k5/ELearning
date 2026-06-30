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
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
} from '../../domain/repositories/forum-member.repository.interface';
import {
  ICloudinaryService,
  CLOUDINARY_SERVICE,
} from '../interfaces/i-cloudinary.service';
import type { ForumPostDomain } from '../../domain/entities/forum-post.domain';
import {
  validateTiptapDoc,
  extractCloudinaryUrls,
  extractPublicIdFromUrl,
} from '../helpers/extract-mentions';

@Injectable()
export class UpdatePostUseCase {
  constructor(
    @Inject(FORUM_POST_REPOSITORY)
    private readonly postRepo: IForumPostRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
    @Inject(CLOUDINARY_SERVICE)
    private readonly cloudinary: ICloudinaryService,
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

    const member = await this.memberRepo.findByForumAndUser(forumId, userId);
    const isAuthor = post.authorId === userId;
    const isModerator =
      member?.role === 'moderator' || member?.role === 'owner';
    if (!isAuthor && !isModerator) {
      throw new ForbiddenException(
        'Only the author or moderators can edit this post',
      );
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
          this.cloudinary.deleteFile(publicId).catch(() => {});
        }
      }
    }

    return this.postRepo.update(postId, input);
  }
}
