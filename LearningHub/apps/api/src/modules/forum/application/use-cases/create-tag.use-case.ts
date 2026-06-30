import { Inject, Injectable, ConflictException } from '@nestjs/common';
import {
  FORUM_TAG_REPOSITORY,
  IForumTagRepository,
} from '../../domain/repositories/forum-tag.repository.interface';
import type { ForumTagDomain } from '../../domain/entities/forum-tag.domain';

export interface CreateTagParams {
  name: string;
  color?: string;
}

@Injectable()
export class CreateTagUseCase {
  constructor(
    @Inject(FORUM_TAG_REPOSITORY)
    private readonly tagRepo: IForumTagRepository,
  ) {}

  async execute(
    params: CreateTagParams,
    userId: string,
  ): Promise<ForumTagDomain> {
    if (!params.name.trim()) {
      throw new ConflictException('Tag name is required');
    }
    return this.tagRepo.create({
      name: params.name.trim(),
      color: params.color,
    });
  }
}
