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
  FORUM_REPOSITORY,
  IForumRepository,
} from '../../domain/repositories/forum.repository.interface';
import {
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
} from '../../domain/repositories/forum-member.repository.interface';
import {
  ICloudinaryService,
  CLOUDINARY_SERVICE,
} from '../interfaces/i-cloudinary.service';
import {
  extractCloudinaryUrls,
  extractPublicIdFromUrl,
} from '../helpers/extract-mentions';

@Injectable()
export class DeletePostUseCase {
  constructor(
    @Inject(FORUM_POST_REPOSITORY)
    private readonly postRepo: IForumPostRepository,
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
    @Inject(CLOUDINARY_SERVICE)
    private readonly cloudinary: ICloudinaryService,
  ) {}

  async execute(
    forumId: string,
    postId: string,
    userId: string,
  ): Promise<void> {
    const post = await this.postRepo.findByIdAndForum(postId, forumId);
    if (!post) throw new NotFoundException('Post not found');

    const member = await this.memberRepo.findByForumAndUser(forumId, userId);
    const isAuthor = post.authorId === userId;
    const isModerator =
      member?.role === 'moderator' || member?.role === 'owner';
    if (!isAuthor && !isModerator) {
      throw new ForbiddenException(
        'Only the author or moderators can delete this post',
      );
    }

    if (post.content) {
      const urls = extractCloudinaryUrls(post.content);
      for (const url of urls) {
        const publicId = extractPublicIdFromUrl(url);
        if (publicId) {
          this.cloudinary.deleteFile(publicId).catch(() => {});
        }
      }
    }

    await this.postRepo.softDelete(postId);
    await this.forumRepo.incrementPostCount(forumId, -1);
  }
}
