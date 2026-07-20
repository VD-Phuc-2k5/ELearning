import type { ForumBookmarkDomain } from '../entities/forum-bookmark.domain';

export interface IForumBookmarkRepository {
  exists(userId: string, postId: string): Promise<boolean>;
  add(userId: string, postId: string): Promise<ForumBookmarkDomain>;
  remove(userId: string, postId: string): Promise<void>;
  findByUser(
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<{ data: ForumBookmarkDomain[]; total: number }>;
}

export const FORUM_BOOKMARK_REPOSITORY = Symbol('IForumBookmarkRepository');
