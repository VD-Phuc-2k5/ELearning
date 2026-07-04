'use server';

import { withTokenRefresh } from '@learning-hub/core';
import {
  AuthRemoteDataSourceImpl,
  ForumRemoteDataSourceImpl,
  ForumRepositoryImpl,
} from '@learning-hub/data';
import { createTokenStore } from '@learning-hub/data/server';
import type {
  AdminReportDetail,
  ForumReport,
  PaginatedResponse,
  PostDetail,
} from '@learning-hub/domain';

const tokenStore = createTokenStore();

async function executeWithRefresh<T>(
  fn: (
    repo: ForumRepositoryImpl,
  ) => Promise<
    import('@learning-hub/core').Either<import('@learning-hub/core').Failure, T>
  >,
): Promise<T> {
  return withTokenRefresh(
    tokenStore,
    async (refreshToken) => {
      const refreshDs = new AuthRemoteDataSourceImpl();
      return refreshDs.refreshToken({ token: refreshToken });
    },
    (token) =>
      fn(new ForumRepositoryImpl(new ForumRemoteDataSourceImpl(), token)),
  );
}

export async function getForumReports(
  forumId: string,
  params?: { status?: string; page?: number; limit?: number },
): Promise<PaginatedResponse<ForumReport>> {
  return executeWithRefresh((repo) => repo.getReports({ forumId, ...params }));
}

export async function resolveForumReport(
  forumId: string,
  reportId: string,
  resolutionNote: string,
): Promise<ForumReport> {
  return executeWithRefresh((repo) =>
    repo.resolveReport(forumId, reportId, resolutionNote),
  );
}

export async function dismissForumReport(
  forumId: string,
  reportId: string,
  note?: string,
): Promise<ForumReport> {
  return executeWithRefresh((repo) =>
    repo.dismissReport(forumId, reportId, note),
  );
}

export async function hideForumPost(
  forumId: string,
  postId: string,
  reasonCode: string,
  reasonText?: string,
): Promise<void> {
  return executeWithRefresh((repo) =>
    repo.hidePost(forumId, postId, reasonCode, reasonText),
  );
}

export async function restoreForumPost(
  forumId: string,
  postId: string,
): Promise<void> {
  return executeWithRefresh((repo) => repo.restorePost(forumId, postId));
}

export async function getAdminReports(params?: {
  status?: string;
  targetType?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<AdminReportDetail>> {
  return executeWithRefresh((repo) => repo.getAdminReports(params ?? {}));
}

export async function adminResolveReport(
  reportId: string,
  resolutionNote: string,
): Promise<ForumReport> {
  return executeWithRefresh((repo) =>
    repo.adminResolveReport(reportId, resolutionNote),
  );
}

export async function adminDismissReport(
  reportId: string,
  note?: string,
): Promise<ForumReport> {
  return executeWithRefresh((repo) => repo.adminDismissReport(reportId, note));
}

export async function adminHidePost(
  postId: string,
  reasonCode: string,
  reasonText?: string,
): Promise<void> {
  return executeWithRefresh((repo) =>
    repo.adminHidePost(postId, reasonCode, reasonText),
  );
}

export async function adminRestorePost(postId: string): Promise<void> {
  return executeWithRefresh((repo) => repo.adminRestorePost(postId));
}

export async function getPostDetail(
  forumId: string,
  postId: string,
): Promise<PostDetail> {
  return executeWithRefresh((repo) => repo.getPostDetail(forumId, postId));
}
