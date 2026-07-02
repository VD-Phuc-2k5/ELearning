import type { ForumCommentDomain } from '../entities/forum-comment.domain';

export interface CreateCommentInput {
  postId: string;
  authorId: string;
  parentId?: string;
  depth: number;
  content: string;
}

export interface GetCommentsInput {
  postId: string;
  page?: number;
  limit?: number;
}

export interface CommentListPage {
  data: ForumCommentDomain[];
  total: number;
}

export interface IForumCommentRepository {
  create(input: CreateCommentInput): Promise<ForumCommentDomain>;
  findById(id: string): Promise<ForumCommentDomain | null>;
  findByIdAndPost(
    id: string,
    postId: string,
  ): Promise<ForumCommentDomain | null>;
  findAll(input: GetCommentsInput): Promise<CommentListPage>;
  update(id: string, content: string): Promise<ForumCommentDomain>;
  updateStatus(id: string, status: string): Promise<ForumCommentDomain>;
  incrementReplyCount(id: string, delta: number): Promise<void>;
  incrementReactionCount(id: string, delta: number): Promise<void>;
  softDelete(id: string): Promise<void>;
}

export const FORUM_COMMENT_REPOSITORY = Symbol('IForumCommentRepository');
