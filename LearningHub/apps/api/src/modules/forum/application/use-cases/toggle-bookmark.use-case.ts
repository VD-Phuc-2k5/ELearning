import { Inject, Injectable } from '@nestjs/common';
import {
  FORUM_BOOKMARK_REPOSITORY,
  IForumBookmarkRepository,
} from '../../domain/repositories/forum-bookmark.repository.interface';

@Injectable()
export class ToggleBookmarkUseCase {
  constructor(
    @Inject(FORUM_BOOKMARK_REPOSITORY)
    private readonly bookmarkRepo: IForumBookmarkRepository,
  ) {}

  async execute(userId: string, postId: string, add: boolean): Promise<void> {
    if (add) {
      if (!(await this.bookmarkRepo.exists(userId, postId))) {
        await this.bookmarkRepo.add(userId, postId);
      }
    } else {
      await this.bookmarkRepo.remove(userId, postId);
    }
  }
}
