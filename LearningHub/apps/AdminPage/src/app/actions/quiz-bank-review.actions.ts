'use server';

import { cookies } from 'next/headers';
import axios from 'axios';
import type { QuestionBank } from '@learning-hub/domain';

const NEST_API = process.env.NEST_API_URL || 'http://localhost:8080';

async function getAdminToken() {
  return (await cookies()).get('adminToken')?.value ?? '';
}

async function refreshAndRetry(originalError: unknown): Promise<string> {
  if (
    !axios.isAxiosError(originalError) ||
    originalError.response?.status !== 401
  ) {
    throw originalError;
  }
  const refreshToken = (await cookies()).get('adminRefreshToken')?.value;
  if (!refreshToken) throw originalError;

  const { data } = await axios.post(`${NEST_API}/api/auth/refresh`, {
    token: refreshToken,
  });
  const cookieStore = await cookies();
  cookieStore.set('adminToken', data.accessToken, {
    maxAge: 900,
    path: '/',
    sameSite: 'lax',
  });
  if (data.refreshToken) {
    cookieStore.set('adminRefreshToken', data.refreshToken, {
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
      sameSite: 'lax',
    });
  }
  return data.accessToken;
}

export async function getPendingBanks(): Promise<QuestionBank[]> {
  const token = await getAdminToken();
  try {
    const { data } = await axios.get(`${NEST_API}/api/quiz/banks`, {
      params: { statusId: 'pending_review', limit: 100 },
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.data ?? [];
  } catch (e) {
    try {
      const newToken = await refreshAndRetry(e);
      const { data } = await axios.get(`${NEST_API}/api/quiz/banks`, {
        params: { statusId: 'pending_review', limit: 100 },
        headers: { Authorization: `Bearer ${newToken}` },
      });
      return data.data ?? [];
    } catch {
      throw new Error('Không thể tải danh sách ngân hàng câu hỏi chờ duyệt.');
    }
  }
}

export async function approveBank(bankId: string): Promise<QuestionBank> {
  const token = await getAdminToken();
  try {
    const { data } = await axios.patch(
      `${NEST_API}/api/admin/quiz/banks/${bankId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.bank ?? data;
  } catch (e) {
    try {
      const newToken = await refreshAndRetry(e);
      const { data } = await axios.patch(
        `${NEST_API}/api/admin/quiz/banks/${bankId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${newToken}` } },
      );
      return data.bank ?? data;
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Duyệt ngân hàng câu hỏi thất bại.';
      throw new Error(message);
    }
  }
}

export async function rejectBank(bankId: string): Promise<QuestionBank> {
  const token = await getAdminToken();
  try {
    const { data } = await axios.patch(
      `${NEST_API}/api/admin/quiz/banks/${bankId}/reject`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return data;
  } catch (e) {
    try {
      const newToken = await refreshAndRetry(e);
      const { data } = await axios.patch(
        `${NEST_API}/api/admin/quiz/banks/${bankId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${newToken}` } },
      );
      return data;
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Từ chối ngân hàng câu hỏi thất bại.';
      throw new Error(message);
    }
  }
}
