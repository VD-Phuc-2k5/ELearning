import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  FORUM_TAG_REPOSITORY,
  IForumTagRepository,
} from '../../domain/repositories/forum-tag.repository.interface';
import type { ForumTagDomain } from '../../domain/entities/forum-tag.domain';

export interface UpdateTagParams {
  name?: string;
  color?: string;
}

@Injectable()
export class UpdateTagUseCase {
  constructor(
    @Inject(FORUM_TAG_REPOSITORY)
    private readonly tagRepo: IForumTagRepository,
  ) {}

  async execute(id: number, params: UpdateTagParams): Promise<ForumTagDomain> {
    const tag = await this.tagRepo.findById(id);
    if (!tag) throw new NotFoundException('Tag not found');
    return this.tagRepo.update(id, params);
  }
}
