import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import {
  FORUM_POST_ATTACHMENT_REPOSITORY,
  IForumPostAttachmentRepository,
} from '../../domain/repositories/forum-draft.repository.interface';
import type { ForumPostAttachmentDomain } from '../../domain/entities/forum-draft.domain';
import {
  ICloudinaryService,
  CLOUDINARY_SERVICE,
} from '../interfaces/i-cloudinary.service';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

@Injectable()
export class UploadAttachmentUseCase {
  constructor(
    @Inject(FORUM_POST_ATTACHMENT_REPOSITORY)
    private readonly attachmentRepo: IForumPostAttachmentRepository,
    @Inject(CLOUDINARY_SERVICE)
    private readonly cloudinary: ICloudinaryService,
  ) {}

  async execute(
    postId: string,
    file: Express.Multer.File,
  ): Promise<ForumPostAttachmentDomain> {
    if (!file) throw new BadRequestException('No file provided');
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed: image/jpeg, image/png, image/webp',
      );
    }
    const { url, publicId } = await this.cloudinary.uploadBuffer(
      file.buffer,
      'forum-attachments',
    );
    void publicId;
    return this.attachmentRepo.create({
      postId,
      fileUrl: url,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
    });
  }
}
