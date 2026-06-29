import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumPostAttachmentEntity } from '../entities/forum-post-attachment.entity';
import { IForumPostAttachmentRepository } from '../../../domain/repositories/forum-draft.repository.interface';
import type { ForumPostAttachmentDomain } from '../../../domain/entities/forum-draft.domain';

@Injectable()
export class ForumPostAttachmentRepository
  implements IForumPostAttachmentRepository
{
  constructor(
    @InjectRepository(ForumPostAttachmentEntity)
    private readonly repo: Repository<ForumPostAttachmentEntity>,
  ) {}

  private toDomain(e: ForumPostAttachmentEntity): ForumPostAttachmentDomain {
    return {
      id: e.id,
      postId: e.postId,
      fileUrl: e.fileUrl,
      fileName: e.fileName,
      fileType: e.fileType,
      fileSize: e.fileSize,
    };
  }

  async create(input: {
    postId: string;
    fileUrl: string;
    fileName: string;
    fileType?: string;
    fileSize?: number;
  }): Promise<ForumPostAttachmentDomain> {
    const entity = this.repo.create({
      postId: input.postId,
      fileUrl: input.fileUrl,
      fileName: input.fileName,
      fileType: input.fileType ?? null,
      fileSize: input.fileSize ?? null,
    });
    return this.toDomain(await this.repo.save(entity));
  }

  async findByPost(postId: string): Promise<ForumPostAttachmentDomain[]> {
    const entities = await this.repo.find({ where: { postId } });
    return entities.map(this.toDomain);
  }
}
