import { Either, Failure } from '@learning-hub/core';
import {
  AdminReportDetail,
  CommentItem,
  CreateCommentParams,
  CreateForumParams,
  CreatePostParams,
  CreateReportParams,
  CreateTagParams,
  ForumDetailResponse,
  ForumInvite,
  ForumListItem,
  ForumReport,
  ForumTag,
  GetReactionsResult,
  GetTargetReactionsParams,
  JoinForumParams,
  ListAdminReportsParams,
  ListCommentsParams,
  ListForumPostsParams,
  ListForumReportsParams,
  ListPostReportsParams,
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
  deleteForum(forumId: string): Promise<Either<Failure, void>>;
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
  createInvite(
    forumId: string,
    inviteeId?: string,
  ): Promise<Either<Failure, ForumInvite>>;
  getInvites(
    forumId: string,
    page?: number,
    limit?: number,
  ): Promise<Either<Failure, PaginatedResponse<ForumInvite>>>;
  revokeInvite(
    forumId: string,
    inviteId: string,
  ): Promise<Either<Failure, void>>;
  acceptInvite(
    token: string,
  ): Promise<
    Either<
      Failure,
      { member: { forumId: string }; forumId: string; forumSlug: string }
    >
  >;
  createReport(
    params: CreateReportParams,
  ): Promise<Either<Failure, ForumReport>>;
  getReports(
    params: ListForumReportsParams,
  ): Promise<Either<Failure, PaginatedResponse<ForumReport>>>;
  getPostReports(
    params: ListPostReportsParams,
  ): Promise<Either<Failure, ForumReport[]>>;
  resolveReport(
    forumId: string,
    reportId: string,
    resolutionNote: string,
  ): Promise<Either<Failure, ForumReport>>;
  dismissReport(
    forumId: string,
    reportId: string,
    note?: string,
  ): Promise<Either<Failure, ForumReport>>;
  hidePost(
    forumId: string,
    postId: string,
    reasonCode: string,
    reasonText?: string,
  ): Promise<Either<Failure, void>>;
  restorePost(forumId: string, postId: string): Promise<Either<Failure, void>>;
  getAdminReports(
    params: ListAdminReportsParams,
  ): Promise<Either<Failure, PaginatedResponse<AdminReportDetail>>>;
  adminResolveReport(
    reportId: string,
    resolutionNote: string,
  ): Promise<Either<Failure, ForumReport>>;
  adminDismissReport(
    reportId: string,
    note?: string,
  ): Promise<Either<Failure, ForumReport>>;
  adminHidePost(
    postId: string,
    reasonCode: string,
    reasonText?: string,
  ): Promise<Either<Failure, void>>;
  adminRestorePost(postId: string): Promise<Either<Failure, void>>;
}
