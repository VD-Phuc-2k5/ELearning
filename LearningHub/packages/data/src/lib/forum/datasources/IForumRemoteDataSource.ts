import {
  CommentItem,
  CreateCommentParams,
  CreateForumParams,
  CreatePostParams,
  ForumDetailResponse,
  ForumListItem,
  ForumTag,
  CreateTagParams,
  UpdateTagParams,
  GetReactionsResult,
  ListCommentsParams,
  ListForumPostsParams,
  ListForumsParams,
  MemberSuggestion,
  PaginatedResponse,
  PostDetail,
  PostListItem,
  SearchMembersParams,
  SetForumRulesParams,
  ToggleCommentReactionParams,
  TogglePostBookmarkParams,
  TogglePostReactionParams,
  UpdateCommentParams,
  UpdateForumParams,
  UpdatePostParams,
  UploadImageResult,
} from '@learning-hub/domain';

export interface IForumRemoteDataSource {
  setToken(token: string): void;
  listForums(
    params: ListForumsParams,
  ): Promise<PaginatedResponse<ForumListItem>>;
  getForumDetail(slug: string): Promise<ForumDetailResponse>;
  createForum(data: CreateForumParams): Promise<ForumListItem>;
  updateForum(params: UpdateForumParams): Promise<ForumListItem>;
  setForumRules(params: SetForumRulesParams): Promise<void>;
  joinForum(forumId: string, message: string | undefined): Promise<void>;
  leaveForum(forumId: string): Promise<void>;
  listForumPosts(
    params: ListForumPostsParams,
  ): Promise<PaginatedResponse<PostListItem>>;
  getPostDetail(forumId: string, postId: string): Promise<PostDetail>;
  createPost(data: CreatePostParams): Promise<PostListItem>;
  updatePost(params: UpdatePostParams): Promise<PostListItem>;
  deletePost(forumId: string, postId: string): Promise<void>;
  listTags(): Promise<ForumTag[]>;
  createTag(data: CreateTagParams): Promise<ForumTag>;
  updateTag(params: UpdateTagParams): Promise<ForumTag>;
  deleteTag(id: number): Promise<void>;
  listComments(
    params: ListCommentsParams,
  ): Promise<PaginatedResponse<CommentItem>>;
  createComment(data: CreateCommentParams): Promise<CommentItem>;
  updateComment(params: UpdateCommentParams): Promise<CommentItem>;
  deleteComment(
    forumId: string,
    postId: string,
    commentId: string,
  ): Promise<void>;
  togglePostReaction(params: TogglePostReactionParams): Promise<void>;
  toggleCommentReaction(params: ToggleCommentReactionParams): Promise<void>;
  getPostReactions(
    forumId: string,
    postId: string,
  ): Promise<GetReactionsResult>;
  getCommentReactions(
    forumId: string,
    postId: string,
    commentId: string,
  ): Promise<GetReactionsResult>;
  togglePostBookmark(params: TogglePostBookmarkParams): Promise<void>;
  uploadImage(formData: FormData): Promise<UploadImageResult>;
  searchMembers(params: SearchMembersParams): Promise<MemberSuggestion[]>;
}
