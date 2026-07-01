import { Either, Failure } from '@learning-hub/core';
import {
  CommentItem,
  CreateCommentParams,
  CreateForumParams,
  CreatePostParams,
  CreateTagParams,
  ForumDetailResponse,
  ForumListItem,
  ForumTag,
  GetReactionsResult,
  GetTargetReactionsParams,
  JoinForumParams,
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
  UpdateTagParams,
  UploadImageResult,
} from '../entities/entities';

export interface IForumRepository {
  listForums(
    params: ListForumsParams,
  ): Promise<Either<Failure, PaginatedResponse<ForumListItem>>>;
  getForumDetail(slug: string): Promise<Either<Failure, ForumDetailResponse>>;
  createForum(data: CreateForumParams): Promise<Either<Failure, ForumListItem>>;
  updateForum(
    params: UpdateForumParams,
  ): Promise<Either<Failure, ForumListItem>>;
  setForumRules(params: SetForumRulesParams): Promise<Either<Failure, void>>;
  joinForum(params: JoinForumParams): Promise<Either<Failure, void>>;
  leaveForum(forumId: string): Promise<Either<Failure, void>>;
  listForumPosts(
    params: ListForumPostsParams,
  ): Promise<Either<Failure, PaginatedResponse<PostListItem>>>;
  getPostDetail(
    forumId: string,
    postId: string,
  ): Promise<Either<Failure, PostDetail>>;
  createPost(data: CreatePostParams): Promise<Either<Failure, PostListItem>>;
  updatePost(params: UpdatePostParams): Promise<Either<Failure, PostListItem>>;
  deletePost(forumId: string, postId: string): Promise<Either<Failure, void>>;
  listTags(): Promise<Either<Failure, ForumTag[]>>;
  createTag(data: CreateTagParams): Promise<Either<Failure, ForumTag>>;
  updateTag(params: UpdateTagParams): Promise<Either<Failure, ForumTag>>;
  deleteTag(id: number): Promise<Either<Failure, void>>;
  listComments(
    params: ListCommentsParams,
  ): Promise<Either<Failure, PaginatedResponse<CommentItem>>>;
  createComment(
    data: CreateCommentParams,
  ): Promise<Either<Failure, CommentItem>>;
  updateComment(
    params: UpdateCommentParams,
  ): Promise<Either<Failure, CommentItem>>;
  deleteComment(
    forumId: string,
    postId: string,
    commentId: string,
  ): Promise<Either<Failure, void>>;
  togglePostReaction(
    params: TogglePostReactionParams,
  ): Promise<Either<Failure, void>>;
  toggleCommentReaction(
    params: ToggleCommentReactionParams,
  ): Promise<Either<Failure, void>>;
  getTargetReactions(
    params: GetTargetReactionsParams,
  ): Promise<Either<Failure, GetReactionsResult>>;
  togglePostBookmark(
    params: TogglePostBookmarkParams,
  ): Promise<Either<Failure, void>>;
  uploadImage(formData: FormData): Promise<Either<Failure, UploadImageResult>>;
  searchMembers(
    params: SearchMembersParams,
  ): Promise<Either<Failure, MemberSuggestion[]>>;
}
