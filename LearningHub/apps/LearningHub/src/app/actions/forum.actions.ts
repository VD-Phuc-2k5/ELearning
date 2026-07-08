'use server';

import {
  ForumRemoteDataSourceImpl,
  ForumRepositoryImpl,
} from '@learning-hub/data';
import {
  ListForumsUsecase,
  GetForumDetailUsecase,
  CreateForumUsecase,
  JoinForumUsecase,
  LeaveForumUsecase,
  ListForumPostsUsecase,
  CreatePostUsecase,
  ListCommentsUsecase,
  CreateCommentUsecase,
  TogglePostReactionUsecase,
  TogglePostBookmarkUsecase,
  SearchMembersUsecase,
} from '@learning-hub/domain';
import { NetworkFailure } from '@learning-hub/core';
import type {
  ForumInvite,
  ForumListItem,
  ForumDetailResponse,
  PostDetail,
  PostListItem,
  CommentItem,
  GetReactionsResult,
  PaginatedResponse,
  UploadImageResult,
  ForumTag,
  ForumReport,
} from '@learning-hub/domain';
export async function listForums(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
}): Promise<PaginatedResponse<ForumListItem>> {
  try {
    const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
    const result = await new ListForumsUsecase(repo).execute(params ?? {});
    if (result.type === 'right') return result.value;
    throw new Error(result.value.message || 'Failed to load forums');
  } catch {
    return { data: [], total: 0 };
  }
}

export async function getForumDetail(
  slug: string,
): Promise<ForumDetailResponse | null> {
  try {
    const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
    const result = await new GetForumDetailUsecase(repo).execute(slug);
    if (result.type === 'right') return result.value;
    if (result.value instanceof NetworkFailure) return null;
    throw new Error(result.value.message);
  } catch {
    return null;
  }
}

export async function createForum(input: {
  name: string;
  description?: string;
  visibility?: 'public' | 'private' | 'hidden';
}): Promise<ForumListItem | undefined> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await new CreateForumUsecase(repo).execute(input);
  if (result.type === 'right') return result.value;
  return undefined;
}

export async function updateForum(
  id: string,
  input: {
    name?: string;
    description?: string;
    visibility?: 'public' | 'private' | 'hidden';
    bannerUrl?: string;
    iconUrl?: string;
  },
): Promise<ForumListItem | undefined> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.updateForum({ id, ...input });
  if (result.type === 'right') return result.value;
  throw new Error(result.value.message);
}

export async function deleteForum(id: string): Promise<void> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.deleteForum(id);
  if (result.type === 'right') return;
  throw new Error(result.value.message);
}

export async function setForumRules(
  id: string,
  rules: Array<{ title: string; body: string }>,
): Promise<void> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.setForumRules({ id, rules });
  if (result.type === 'right') return;
  throw new Error(result.value.message);
}

export async function joinForum(
  forumId: string,
  message?: string,
): Promise<void> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await new JoinForumUsecase(repo).execute({ forumId, message });
  if (result.type === 'right') return;
  throw new Error(result.value.message);
}

export async function leaveForum(forumId: string): Promise<void> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await new LeaveForumUsecase(repo).execute(forumId);
  if (result.type === 'right') return;
  throw new Error(result.value.message);
}

export async function listForumPosts(
  forumId: string,
  params?: { page?: number; limit?: number; tagId?: number; search?: string },
): Promise<PaginatedResponse<PostListItem>> {
  try {
    const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
    const result = await new ListForumPostsUsecase(repo).execute({
      forumId,
      ...params,
    });
    if (result.type === 'right') return result.value;
    throw new Error(result.value.message);
  } catch {
    return { data: [], total: 0 };
  }
}

export async function createPost(
  forumId: string,
  input: {
    title: string;
    content?: Record<string, unknown>;
    postType?: string;
    tagIds?: number[];
    roadmapId?: string;
    questionBankId?: string;
  },
): Promise<PostListItem> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await new CreatePostUsecase(repo).execute({
    forumId,
    ...input,
  });
  if (result.type === 'right') return result.value;
  throw new Error(result.value.message || 'Failed to create post');
}

export async function listComments(
  forumId: string,
  postId: string,
  params?: { page?: number; limit?: number },
): Promise<PaginatedResponse<CommentItem>> {
  try {
    const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
    const result = await new ListCommentsUsecase(repo).execute({
      forumId,
      postId,
      ...params,
    });
    if (result.type === 'right') return result.value;
    throw new Error(result.value.message);
  } catch {
    return { data: [], total: 0 };
  }
}

export async function createComment(
  forumId: string,
  postId: string,
  content: string,
  parentId?: string,
  mentionIds?: string[],
): Promise<CommentItem> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await new CreateCommentUsecase(repo).execute({
    forumId,
    postId,
    content,
    parentId,
    mentionIds,
  });
  if (result.type === 'right') return result.value;
  throw new Error(result.value.message);
}

export async function toggleCommentReaction(
  forumId: string,
  postId: string,
  commentId: string,
  emoji: string,
  add: boolean,
): Promise<void> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.toggleCommentReaction({
    forumId,
    postId,
    commentId,
    emoji,
    add,
  });
  if (result.type === 'right') return;
  throw new Error(result.value.message);
}

export async function getTargetReactions(params: {
  targetType: 'post' | 'comment';
  targetId: string;
  forumId: string;
  postId?: string;
}): Promise<GetReactionsResult> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.getTargetReactions(params);
  if (result.type === 'right') return result.value;
  return { groups: [], total: 0 };
}

export async function togglePostReaction(
  forumId: string,
  postId: string,
  emoji: string,
  add: boolean,
): Promise<void> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await new TogglePostReactionUsecase(repo).execute({
    forumId,
    postId,
    emoji,
    add,
  });
  if (result.type === 'right') return;
  throw new Error(result.value.message);
}

export async function togglePostBookmark(
  postId: string,
  add: boolean,
): Promise<void> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await new TogglePostBookmarkUsecase(repo).execute({
    postId,
    add,
  });
  if (result.type === 'right') return;
  throw new Error(result.value.message);
}

export async function getPostDetail(
  forumId: string,
  postId: string,
): Promise<PostDetail> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.getPostDetail(forumId, postId);
  if (result.type === 'right') return result.value;
  throw new Error(result.value.message);
}

export async function updatePost(
  forumId: string,
  postId: string,
  data: {
    title?: string;
    content?: Record<string, unknown>;
    tagIds?: number[];
  },
): Promise<PostListItem | undefined> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.updatePost({
    forumId,
    postId,
    ...data,
  });
  if (result.type === 'right') return result.value;
  throw new Error(result.value.message);
}

export async function deletePost(
  forumId: string,
  postId: string,
): Promise<void> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.deletePost(forumId, postId);
  if (result.type === 'right') return;
  throw new Error(result.value.message);
}

export async function updateComment(
  forumId: string,
  postId: string,
  commentId: string,
  content: string,
): Promise<CommentItem | undefined> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.updateComment({
    forumId,
    postId,
    commentId,
    content,
  });
  if (result.type === 'right') return result.value;
  throw new Error(result.value.message);
}

export async function deleteComment(
  forumId: string,
  postId: string,
  commentId: string,
): Promise<void> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.deleteComment(forumId, postId, commentId);
  if (result.type === 'right') return;
  throw new Error(result.value.message);
}

export async function uploadForumImage(
  formData: FormData,
): Promise<UploadImageResult> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.uploadImage(formData);
  if (result.type === 'right') return result.value;
  throw new Error(result.value.message);
}

export async function listTags(): Promise<ForumTag[]> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.listTags();
  if (result.type === 'right') return result.value;
  throw new Error(result.value.message);
}

export async function createTag(input: {
  name: string;
  color?: string;
}): Promise<ForumTag> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.createTag(input);
  if (result.type === 'right') return result.value;
  throw new Error(result.value.message);
}

export async function updateTag(
  id: number,
  input: { name?: string; color?: string },
): Promise<ForumTag | undefined> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.updateTag({ id, ...input });
  if (result.type === 'right') return result.value;
  return undefined;
}

export async function deleteTag(id: number): Promise<void> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.deleteTag(id);
  if (result.type === 'right') return;
  throw new Error(result.value.message);
}

export async function updatePostTags(
  forumId: string,
  postId: string,
  tagIds: number[],
): Promise<PostListItem | undefined> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.updatePost({
    forumId,
    postId,
    tagIds,
  });
  if (result.type === 'right') return result.value;
  return undefined;
}

export interface MemberSuggestion {
  userId: string;
  username: string;
  avatarUrl: string | null;
}

export async function searchForumMembers(
  forumId: string,
  query: string,
  limit = 5,
): Promise<MemberSuggestion[]> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await new SearchMembersUsecase(repo).execute({
    forumId,
    query,
    limit,
  });
  if (result.type === 'right') return result.value;
  return [];
}

export async function createInvite(
  forumId: string,
  inviteeId?: string,
): Promise<ForumInvite> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.createInvite(forumId, inviteeId);
  if (result.type === 'right') return result.value;
  throw new Error(result.value.message);
}

export async function getInvites(
  forumId: string,
  page?: number,
  limit?: number,
): Promise<PaginatedResponse<ForumInvite>> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.getInvites(forumId, page, limit);
  if (result.type === 'right') return result.value;
  throw new Error(result.value.message);
}

export async function revokeInvite(
  forumId: string,
  inviteId: string,
): Promise<void> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.revokeInvite(forumId, inviteId);
  if (result.type === 'right') return;
  throw new Error(result.value.message);
}

export async function acceptInvite(token: string): Promise<{
  member: { forumId: string };
  forumId: string;
  forumSlug: string;
}> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.acceptInvite(token);
  if (result.type === 'right') return result.value;
  throw new Error(result.value.message);
}

export async function createReport(params: {
  targetType: 'forum' | 'post' | 'comment';
  targetId: string;
  reason: string;
  description?: string;
}): Promise<ForumReport> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.createReport(params);
  if (result.type === 'right') return result.value;
  throw new Error(result.value.message);
}

export async function getForumReports(
  forumId: string,
  params?: {
    status?: string;
    targetType?: string;
    page?: number;
    limit?: number;
  },
): Promise<PaginatedResponse<ForumReport>> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.getReports({ forumId, ...params });
  if (result.type === 'right') return result.value;
  throw new Error(result.value.message);
}

export async function getPostReports(
  forumId: string,
  postId: string,
): Promise<ForumReport[]> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.getPostReports({ forumId, postId });
  if (result.type === 'right') return result.value;
  throw new Error(result.value.message);
}

export async function resolveReport(
  forumId: string,
  reportId: string,
  resolutionNote: string,
): Promise<ForumReport> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.resolveReport(forumId, reportId, resolutionNote);
  if (result.type === 'right') return result.value;
  throw new Error(result.value.message);
}

export async function dismissReport(
  forumId: string,
  reportId: string,
  note?: string,
): Promise<ForumReport> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.dismissReport(forumId, reportId, note);
  if (result.type === 'right') return result.value;
  throw new Error(result.value.message);
}

export async function hidePost(
  forumId: string,
  postId: string,
  reasonCode: string,
  reasonText?: string,
): Promise<void> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.hidePost(forumId, postId, reasonCode, reasonText);
  if (result.type === 'right') return;
  throw new Error(result.value.message);
}

export async function restorePost(
  forumId: string,
  postId: string,
): Promise<void> {
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
  const result = await repo.restorePost(forumId, postId);
  if (result.type === 'right') return;
  throw new Error(result.value.message);
}
