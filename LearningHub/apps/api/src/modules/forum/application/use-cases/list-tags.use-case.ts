import { Inject, Injectable } from '@nestjs/common';
import {
  FORUM_TAG_REPOSITORY,
  IForumTagRepository,
} from '../../domain/repositories/forum-tag.repository.interface';
import type { ForumTagDomain } from '../../domain/entities/forum-tag.domain';

@Injectable()
export class ListTagsUseCase {
  constructor(
    @Inject(FORUM_TAG_REPOSITORY)
    private readonly tagRepo: IForumTagRepository,
  ) {}

  execute(): Promise<ForumTagDomain[]> {
    return this.tagRepo.findAll();
  }
}
