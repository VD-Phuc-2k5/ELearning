'use server';

import axios from 'axios';
import { cookies } from 'next/headers';
import type { QuestionBank, Question } from '@learning-hub/domain';

const NEST_API = process.env.NEST_API_URL || 'http://localhost:8080';

async function cookieHeader(): Promise<string> {
  const jar = await cookies();
  return jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');
}

export async function getPendingBanks(): Promise<QuestionBank[]> {
  const { data } = await axios.get(`${NEST_API}/quiz/banks`, {
    params: { statusId: 'pending_review', limit: 100 },
    headers: { Cookie: await cookieHeader() },
  });
  return data.data ?? [];
}

export async function approveBank(bankId: string): Promise<QuestionBank> {
  const { data } = await axios.patch(
    `${NEST_API}/admin/quiz/banks/${bankId}/approve`,
    {},
    { headers: { Cookie: await cookieHeader() } },
  );
  return data.bank ?? data;
}

export async function rejectBank(
  bankId: string,
  reason?: string,
): Promise<QuestionBank> {
  const { data } = await axios.patch(
    `${NEST_API}/admin/quiz/banks/${bankId}/reject`,
    { reason: reason || undefined },
    { headers: { Cookie: await cookieHeader() } },
  );
  return data;
}

export async function getBankDetail(
  bankId: string,
): Promise<QuestionBank | null> {
  const { data } = await axios.get(`${NEST_API}/quiz/banks/${bankId}`, {
    headers: { Cookie: await cookieHeader() },
  });
  return data;
}

export async function getBankQuestions(bankId: string): Promise<Question[]> {
  const { data } = await axios.get(
    `${NEST_API}/quiz/banks/${bankId}/questions`,
    {
      params: { showAnswers: 'true' },
      headers: { Cookie: await cookieHeader() },
    },
  );
  return Array.isArray(data) ? data : (data.questions ?? []);
}
