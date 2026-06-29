import { Inject, Injectable } from '@nestjs/common';
import {
  FORUM_BOOKMARK_REPOSITORY,
  IForumBookmarkRepository,
} from '../../domain/repositories/forum-bookmark.repository.interface';
import type { ForumBookmarkDomain } from '../../domain/entities/forum-bookmark.domain';

@Injectable()
export class GetBookmarksUseCase {
  constructor(
    @Inject(FORUM_BOOKMARK_REPOSITORY)
    private readonly bookmarkRepo: IForumBookmarkRepository,
  ) {}

  execute(
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<{ data: ForumBookmarkDomain[]; total: number }> {
    return this.bookmarkRepo.findByUser(userId, page, limit);
  }
}
