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
} from '../../domain/repositories/forum.repository.interface';
import {
  ICloudinaryService,
  CLOUDINARY_SERVICE,
} from '../interfaces/i-cloudinary.service';
import { extractPublicIdFromUrl } from '../helpers/extract-mentions';

@Injectable()
export class DeleteForumUseCase {
  constructor(
    @Inject(FORUM_REPOSITORY)
    private readonly forumRepo: IForumRepository,
    @Inject(FORUM_MEMBER_REPOSITORY)
    private readonly memberRepo: IForumMemberRepository,
    @Inject(CLOUDINARY_SERVICE)
    private readonly cloudinary: ICloudinaryService,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const forum = await this.forumRepo.findById(id);
    if (!forum) throw new NotFoundException('Forum not found');

    const member = await this.memberRepo.findByForumAndUser(id, userId);
    if (!member || member.role !== 'owner') {
      throw new ForbiddenException('Only the owner can delete this forum');
    }

    if (forum.bannerUrl) {
      const publicId = extractPublicIdFromUrl(forum.bannerUrl);
      if (publicId) this.cloudinary.deleteFile(publicId).catch(() => undefined);
    }
    if (forum.iconUrl) {
      const publicId = extractPublicIdFromUrl(forum.iconUrl);
      if (publicId) this.cloudinary.deleteFile(publicId).catch(() => undefined);
    }

    await this.forumRepo.delete(id);
  }
}
