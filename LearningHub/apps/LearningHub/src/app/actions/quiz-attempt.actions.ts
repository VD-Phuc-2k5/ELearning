'use server';

import { Either, Failure } from '@learning-hub/core';
import {
  QuizRemoteDataSourceImpl,
  QuizRepositoryImpl,
} from '@learning-hub/data';
import type {
  AttemptList,
  QuizAttemptDetail,
  UserBankProgress,
} from '@learning-hub/domain';
import {
  GetAttemptDetailQuizParams,
  GetAttemptDetailQuizUsecase,
  GetAttemptsQuizParams,
  GetAttemptsQuizUsecase,
  GetBankProgressQuizParams,
  GetBankProgressQuizUsecase,
} from '@learning-hub/domain';
import { cookies } from 'next/headers';

function unwrap<T>(r: Either<Failure, T>): T {
  if (r.type === 'left') throw new Error(r.value.message);
  return r.value;
}

async function getRepo() {
  const token = (await cookies()).get('accessToken')?.value ?? '';
  return new QuizRepositoryImpl(new QuizRemoteDataSourceImpl(), token);
}

export async function listAttempts(params?: {
  page?: number;
  limit?: number;
  bankId?: string;
}): Promise<AttemptList> {
  const repo = await getRepo();
  const result = await new GetAttemptsQuizUsecase(repo).execute(
    new GetAttemptsQuizParams(params?.page, params?.limit, params?.bankId),
  );
  return result.type === 'right' ? result.value : { data: [], total: 0 };
}

export async function getAttemptDetail(id: string): Promise<QuizAttemptDetail> {
  const repo = await getRepo();
  return unwrap(
    await new GetAttemptDetailQuizUsecase(repo).execute(
      new GetAttemptDetailQuizParams(id),
    ),
  );
}

export async function getBankProgress(
  bankId: string,
): Promise<UserBankProgress | null> {
  const repo = await getRepo();
  return unwrap(
    await new GetBankProgressQuizUsecase(repo).execute(
      new GetBankProgressQuizParams(bankId),
    ),
  );
}
