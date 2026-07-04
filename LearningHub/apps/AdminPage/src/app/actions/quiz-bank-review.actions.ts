'use server';

import axios from 'axios';
import {
  Either,
  Failure,
  left,
  right,
  AuthenticationFailure,
  UnknownFailure,
  withTokenRefresh,
} from '@learning-hub/core';
import { AuthRemoteDataSourceImpl } from '@learning-hub/data';
import { createTokenStore } from '@learning-hub/data/server';
import type { QuestionBank } from '@learning-hub/domain';

const NEST_API = process.env.NEST_API_URL || 'http://localhost:8080';

const tokenStore = createTokenStore();

async function executeWithRefresh<T>(
  fn: (token: string) => Promise<T>,
): Promise<T> {
  return withTokenRefresh(
    tokenStore,
    async (refreshToken) => {
      const refreshDs = new AuthRemoteDataSourceImpl();
      return refreshDs.refreshToken({ token: refreshToken });
    },
    async (token): Promise<Either<Failure, T>> => {
      try {
        return right(await fn(token));
      } catch (e) {
        if (axios.isAxiosError(e)) {
          if (e.response?.status === 401) {
            return left(new AuthenticationFailure('Unauthorized'));
          }
          return left(
            new UnknownFailure(
              e.response?.data?.message || e.message || 'Request failed',
            ),
          );
        }
        return left(
          new UnknownFailure(e instanceof Error ? e.message : 'Request failed'),
        );
      }
    },
  );
}

export async function getPendingBanks(): Promise<QuestionBank[]> {
  return executeWithRefresh(async (token) => {
    const { data } = await axios.get(`${NEST_API}/api/quiz/banks`, {
      params: { statusId: 'pending_review', limit: 100 },
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.data ?? [];
  });
}

export async function approveBank(bankId: string): Promise<QuestionBank> {
  return executeWithRefresh(async (token) => {
    const { data } = await axios.patch(
      `${NEST_API}/api/admin/quiz/banks/${bankId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.bank ?? data;
  });
}

export async function rejectBank(bankId: string): Promise<QuestionBank> {
  return executeWithRefresh(async (token) => {
    const { data } = await axios.patch(
      `${NEST_API}/api/admin/quiz/banks/${bankId}/reject`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return data;
  });
}
