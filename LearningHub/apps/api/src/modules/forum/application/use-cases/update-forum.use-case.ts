import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  FORUM_MEMBER_REPOSITORY,
  IForumMemberRepository,
} from '../../domain/repositories/forum-member.repository.interface';
import {
  FORUM_REPOSITORY,
  IForumRepository,
  type UpdateForumInput,
} from '../../domain/repositories/forum.repository.interface';
import {
  ICloudinaryService,
  CLOUDINARY_SERVICE,
} from '../interfaces/i-cloudinary.service';
import { extractPublicIdFromUrl } from '../helpers/extract-mentions';
import type { ForumDomain } from '../../domain/entities/forum.domain';

@Injectable()
export class UpdateForumUseCase {
  constructor(
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
    @Inject(CLOUDINARY_SERVICE)
    private readonly cloudinary: ICloudinaryService,
  ) {}

  async execute(
    id: string,
    input: UpdateForumInput,
    userId: string,
  ): Promise<ForumDomain> {
    const forum = await this.forumRepo.findById(id);
    if (!forum) throw new NotFoundException('Forum not found');

    const member = await this.memberRepo.findByForumAndUser(id, userId);
    if (!member || member.role !== 'owner') {
      throw new ForbiddenException('Only the owner can update this forum');
    }

    if (
      input.bannerUrl !== undefined &&
      forum.bannerUrl &&
      input.bannerUrl !== forum.bannerUrl
    ) {
      const publicId = extractPublicIdFromUrl(forum.bannerUrl);
      if (publicId) this.cloudinary.deleteFile(publicId).catch(() => {});
    }
    if (
      input.iconUrl !== undefined &&
      forum.iconUrl &&
      input.iconUrl !== forum.iconUrl
    ) {
      const publicId = extractPublicIdFromUrl(forum.iconUrl);
      if (publicId) this.cloudinary.deleteFile(publicId).catch(() => {});
    }

    return this.forumRepo.update(id, input);
  }
}
