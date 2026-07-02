'use server';

import {
  Either,
  unwrap,
  Failure,
  AuthenticationFailure,
} from '@learning-hub/core';
import {
  AuthRemoteDataSourceImpl,
  ForumRemoteDataSourceImpl,
  ForumRepositoryImpl,
} from '@learning-hub/data';
import type {
  AdminReportDetail,
  ForumReport,
  PaginatedResponse,
  PostDetail,
} from '@learning-hub/domain';
import { cookies } from 'next/headers';

async function getRepo() {
  const token = (await cookies()).get('adminToken')?.value ?? '';
  return new ForumRepositoryImpl(new ForumRemoteDataSourceImpl(), token);
}

async function executeWithRefresh<T>(
  fn: (repo: ForumRepositoryImpl) => Promise<Either<Failure, T>>,
): Promise<T> {
  const repo = await getRepo();
  const result = await fn(repo);
  if (result.type === 'left' && result.value instanceof AuthenticationFailure) {
    const refreshToken = (await cookies()).get('adminRefreshToken')?.value;
    if (refreshToken) {
      try {
        const refreshDs = new AuthRemoteDataSourceImpl();
        const { accessToken, refreshToken: newRefresh } =
          await refreshDs.refreshToken({ token: refreshToken });
        const cookieStore = await cookies();
        cookieStore.set('adminToken', accessToken, {
          maxAge: 900,
          path: '/',
          sameSite: 'lax',
        });
        cookieStore.set('adminRefreshToken', newRefresh, {
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
          sameSite: 'lax',
        });
        const newRepo = await getRepo();
        const retryResult = await fn(newRepo);
        return unwrap(retryResult);
      } catch {
        // fall through
      }
    }
  }
  return unwrap(result);
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
