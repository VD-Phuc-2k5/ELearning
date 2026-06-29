import { Either, Failure } from '@learning-hub/core';
import {
  CommentItem,
  CreateCommentParams,
  CreateForumParams,
  CreatePostParams,
  ForumDetailResponse,
  ForumListItem,
  JoinForumParams,
  ListCommentsParams,
  ListForumPostsParams,
  ListForumsParams,
  PaginatedResponse,
  PostListItem,
  TogglePostBookmarkParams,
  TogglePostReactionParams,
} from '../entities/entities';

export interface IForumRepository {
  listForums(
    params: ListForumsParams,
  ): Promise<Either<Failure, PaginatedResponse<ForumListItem>>>;
  getForumDetail(slug: string): Promise<Either<Failure, ForumDetailResponse>>;
  createForum(data: CreateForumParams): Promise<Either<Failure, ForumListItem>>;
  joinForum(params: JoinForumParams): Promise<Either<Failure, void>>;
  leaveForum(forumId: string): Promise<Either<Failure, void>>;
  listForumPosts(
    params: ListForumPostsParams,
  ): Promise<Either<Failure, PaginatedResponse<PostListItem>>>;
  createPost(data: CreatePostParams): Promise<Either<Failure, PostListItem>>;
  listComments(
    params: ListCommentsParams,
  ): Promise<Either<Failure, PaginatedResponse<CommentItem>>>;
  createComment(
    data: CreateCommentParams,
  ): Promise<Either<Failure, CommentItem>>;
  togglePostReaction(
    params: TogglePostReactionParams,
  ): Promise<Either<Failure, void>>;
  togglePostBookmark(
    params: TogglePostBookmarkParams,
  ): Promise<Either<Failure, void>>;
}
