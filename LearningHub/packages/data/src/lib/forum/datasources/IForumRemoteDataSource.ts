import {
  CommentItem,
  CreateCommentParams,
  CreateForumParams,
  CreatePostParams,
  ForumDetailResponse,
  ForumListItem,
  ListCommentsParams,
  ListForumPostsParams,
  ListForumsParams,
  PaginatedResponse,
  PostListItem,
  TogglePostBookmarkParams,
  TogglePostReactionParams,
} from '@learning-hub/domain';

export interface IForumRemoteDataSource {
  setToken(token: string): void;
  listForums(
    params: ListForumsParams,
  ): Promise<PaginatedResponse<ForumListItem>>;
  getForumDetail(slug: string): Promise<ForumDetailResponse>;
  createForum(data: CreateForumParams): Promise<ForumListItem>;
  joinForum(forumId: string, message: string | undefined): Promise<void>;
  leaveForum(forumId: string): Promise<void>;
  listForumPosts(
    params: ListForumPostsParams,
  ): Promise<PaginatedResponse<PostListItem>>;
  createPost(data: CreatePostParams): Promise<PostListItem>;
  listComments(
    params: ListCommentsParams,
  ): Promise<PaginatedResponse<CommentItem>>;
  createComment(data: CreateCommentParams): Promise<CommentItem>;
  togglePostReaction(params: TogglePostReactionParams): Promise<void>;
  togglePostBookmark(params: TogglePostBookmarkParams): Promise<void>;
}
