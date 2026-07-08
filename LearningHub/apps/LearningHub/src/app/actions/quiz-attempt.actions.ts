'use server';

async function unwrapOrThrow<T>(
  promise: Promise<{ type: string; value: any }>,
): Promise<T> {
  const result = await promise;
  if (result.type === 'left') throw new Error(result.value.message);
  return result.value;
}
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
function getRepo() {
  return new QuizRepositoryImpl(new QuizRemoteDataSourceImpl());
}

export async function listAttempts(params?: {
  page?: number;
  limit?: number;
  bankId?: string;
  uploaderId?: string;
}): Promise<AttemptList> {
  const repo = getRepo();
  const result = await new GetAttemptsQuizUsecase(repo).execute(
    new GetAttemptsQuizParams(
      params?.page,
      params?.limit,
      params?.bankId,
      params?.uploaderId,
    ),
  );
  return result.type === 'right' ? result.value : { data: [], total: 0 };
}

export async function getAttemptDetail(
  id: string,
): Promise<QuizAttemptDetail | null> {
  try {
    const repo = getRepo();
    return unwrapOrThrow(
      new GetAttemptDetailQuizUsecase(repo).execute(
        new GetAttemptDetailQuizParams(id),
      ),
    );
  } catch {
    return null;
  }
}

export async function getBankProgress(
  bankId: string,
): Promise<UserBankProgress | null> {
  try {
    const repo = getRepo();
    return unwrapOrThrow(
      new GetBankProgressQuizUsecase(repo).execute(
        new GetBankProgressQuizParams(bankId),
      ),
    );
  } catch {
    return null;
  }
}
