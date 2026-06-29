import type { PostStatus, PostType } from '../entities/forum-post.domain';
import type { ForumPostDomain } from '../entities/forum-post.domain';

export interface CreatePostInput {
  forumId: string;
  authorId: string;
  title: string;
  content?: Record<string, unknown>;
  postType?: PostType;
  status?: PostStatus;
  roadmapId?: string;
  questionBankId?: string;
  tagIds?: number[];
}

export interface GetPostsInput {
  forumId: string;
  page?: number;
  limit?: number;
  tagId?: number;
  status?: PostStatus;
  includeHidden?: boolean;
  pinnedFirst?: boolean;
}

export interface UpdatePostInput {
  title?: string;
  content?: Record<string, unknown>;
  tagIds?: number[];
}

export interface PostListPage {
  data: ForumPostDomain[];
  total: number;
}

export interface IForumPostRepository {
  create(input: CreatePostInput): Promise<ForumPostDomain>;
  findById(id: string): Promise<ForumPostDomain | null>;
  findByIdAndForum(
    id: string,
    forumId: string,
  ): Promise<ForumPostDomain | null>;
  findAll(input: GetPostsInput): Promise<PostListPage>;
  update(id: string, input: UpdatePostInput): Promise<ForumPostDomain>;
  updateStatus(id: string, status: PostStatus): Promise<ForumPostDomain>;
  setPinned(id: string, isPinned: boolean): Promise<ForumPostDomain>;
  setLocked(id: string, isLocked: boolean): Promise<ForumPostDomain>;
  incrementCommentCount(id: string, delta: number): Promise<void>;
  incrementReactionCount(id: string, delta: number): Promise<void>;
  incrementViewCount(id: string, delta: number): Promise<void>;
  softDelete(id: string): Promise<void>;
}

export const FORUM_POST_REPOSITORY = Symbol('IForumPostRepository');
