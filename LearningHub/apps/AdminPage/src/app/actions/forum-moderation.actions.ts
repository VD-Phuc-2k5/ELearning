'use server';

import { unwrap } from '@learning-hub/core';
import {
  ForumRemoteDataSourceImpl,
  ForumRepositoryImpl,
} from '@learning-hub/data';
import type {
  AdminReportDetail,
  ForumReport,
  PaginatedResponse,
  PostDetail,
} from '@learning-hub/domain';

function makeRepo() {
  return new ForumRepositoryImpl(new ForumRemoteDataSourceImpl());
}

async function exec<T>(
  fn: (
    repo: ForumRepositoryImpl,
  ) => Promise<
    import('@learning-hub/core').Either<import('@learning-hub/core').Failure, T>
  >,
): Promise<T> {
  return unwrap(await fn(makeRepo()));
}

export async function getForumReports(
  forumId: string,
  params?: { status?: string; page?: number; limit?: number },
): Promise<PaginatedResponse<ForumReport>> {
  return exec((repo) => repo.getReports({ forumId, ...params }));
}

export async function resolveForumReport(
  forumId: string,
  reportId: string,
  resolutionNote: string,
): Promise<ForumReport> {
  return exec((repo) => repo.resolveReport(forumId, reportId, resolutionNote));
}

export async function dismissForumReport(
  forumId: string,
  reportId: string,
  note?: string,
): Promise<ForumReport> {
  return exec((repo) => repo.dismissReport(forumId, reportId, note));
}

export async function hideForumPost(
  forumId: string,
  postId: string,
  reasonCode: string,
  reasonText?: string,
): Promise<void> {
  return exec((repo) => repo.hidePost(forumId, postId, reasonCode, reasonText));
}

export async function restoreForumPost(
  forumId: string,
  postId: string,
): Promise<void> {
  return exec((repo) => repo.restorePost(forumId, postId));
}

export async function getAdminReports(params?: {
  status?: string;
  targetType?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<AdminReportDetail>> {
  return exec((repo) => repo.getAdminReports(params ?? {}));
}

export async function adminResolveReport(
  reportId: string,
  resolutionNote: string,
): Promise<ForumReport> {
  return exec((repo) => repo.adminResolveReport(reportId, resolutionNote));
}

export async function adminDismissReport(
  reportId: string,
  note?: string,
): Promise<ForumReport> {
  return exec((repo) => repo.adminDismissReport(reportId, note));
}

export async function adminHidePost(
  postId: string,
  reasonCode: string,
  reasonText?: string,
): Promise<void> {
  return exec((repo) => repo.adminHidePost(postId, reasonCode, reasonText));
}

export async function adminRestorePost(postId: string): Promise<void> {
  return exec((repo) => repo.adminRestorePost(postId));
}

export async function getPostDetail(
  forumId: string,
  postId: string,
): Promise<PostDetail> {
  return exec((repo) => repo.getPostDetail(forumId, postId));
}
