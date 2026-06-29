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
  type ForumListItem,
  type ForumDetail,
  type ForumRule,
  type ForumDetailResponse,
  type PostListItem,
  type CommentItem,
  type PaginatedResponse,
} from '@learning-hub/domain';
import { cookies } from 'next/headers';

export type {
  ForumListItem,
  ForumDetail,
  ForumRule,
  ForumDetailResponse,
  PostListItem,
  CommentItem,
  PaginatedResponse,
};

async function getToken(): Promise<string | undefined> {
  return (await cookies()).get('accessToken')?.value;
}

export async function listForums(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
}): Promise<PaginatedResponse<ForumListItem>> {
  const token = await getToken();
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl(), token);
  const result = await new ListForumsUsecase(repo).execute(params ?? {});
  if (result.type === 'right') return result.value;
  throw new Error(result.value.message);
}

export async function getForumDetail(
  slug: string,
): Promise<ForumDetailResponse | undefined> {
  const token = await getToken();
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl(), token);
  const result = await new GetForumDetailUsecase(repo).execute(slug);
  if (result.type === 'right') return result.value;
  return undefined;
}

export async function createForum(input: {
  name: string;
  description?: string;
  visibility?: 'public' | 'private' | 'hidden';
}): Promise<ForumListItem | undefined> {
  const token = await getToken();
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl(), token);
  const result = await new CreateForumUsecase(repo).execute(input);
  if (result.type === 'right') return result.value;
  return undefined;
}

export async function joinForum(
  forumId: string,
  message?: string,
): Promise<void> {
  const token = await getToken();
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl(), token);
  const result = await new JoinForumUsecase(repo).execute({ forumId, message });
  if (result.type === 'right') return;
  throw new Error(result.value.message);
}

export async function leaveForum(forumId: string): Promise<void> {
  const token = await getToken();
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl(), token);
  const result = await new LeaveForumUsecase(repo).execute(forumId);
  if (result.type === 'right') return;
  throw new Error(result.value.message);
}

export async function listForumPosts(
  forumId: string,
  params?: { page?: number; limit?: number; tagId?: number },
): Promise<PaginatedResponse<PostListItem> | undefined> {
  const token = await getToken();
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl(), token);
  const result = await new ListForumPostsUsecase(repo).execute({
    forumId,
    ...params,
  });
  if (result.type === 'right') return result.value;
  return undefined;
}

export async function createPost(
  forumId: string,
  input: {
    title: string;
    content?: Record<string, unknown>;
    postType?: string;
    roadmapId?: string;
    questionBankId?: string;
  },
): Promise<PostListItem | undefined> {
  const token = await getToken();
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl(), token);
  const result = await new CreatePostUsecase(repo).execute({
    forumId,
    ...input,
  });
  if (result.type === 'right') return result.value;
  return undefined;
}

export async function listComments(
  forumId: string,
  postId: string,
  params?: { page?: number; limit?: number },
): Promise<PaginatedResponse<CommentItem> | undefined> {
  const token = await getToken();
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl(), token);
  const result = await new ListCommentsUsecase(repo).execute({
    forumId,
    postId,
    ...params,
  });
  if (result.type === 'right') return result.value;
  return undefined;
}

export async function createComment(
  forumId: string,
  postId: string,
  content: string,
  parentId?: string,
): Promise<CommentItem | undefined> {
  const token = await getToken();
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl(), token);
  const result = await new CreateCommentUsecase(repo).execute({
    forumId,
    postId,
    content,
    parentId,
  });
  if (result.type === 'right') return result.value;
  return undefined;
}

export async function togglePostReaction(
  forumId: string,
  postId: string,
  emoji: string,
  add: boolean,
): Promise<void> {
  const token = await getToken();
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl(), token);
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
  const token = await getToken();
  const repo = new ForumRepositoryImpl(new ForumRemoteDataSourceImpl(), token);
  const result = await new TogglePostBookmarkUsecase(repo).execute({
    postId,
    add,
  });
  if (result.type === 'right') return;
  throw new Error(result.value.message);
}
