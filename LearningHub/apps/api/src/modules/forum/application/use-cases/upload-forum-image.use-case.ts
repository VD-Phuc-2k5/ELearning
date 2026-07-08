import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import {
  ICloudinaryService,
  CLOUDINARY_SERVICE,
} from '../interfaces/i-cloudinary.service';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

@Injectable()
export class UploadForumImageUseCase {
  constructor(
    @Inject(CLOUDINARY_SERVICE)
    private readonly cloudinary: ICloudinaryService,
  ) {}

  async execute(file: {
    buffer: Buffer;
    size: number;
    mimetype: string;
  }): Promise<{ url: string; publicId: string }> {
    if (!file) throw new BadRequestException('No file provided');
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed: image/jpeg, image/png, image/webp',
      );
    }
    return this.cloudinary.uploadBuffer(file.buffer, 'forum-images');
  }
}
