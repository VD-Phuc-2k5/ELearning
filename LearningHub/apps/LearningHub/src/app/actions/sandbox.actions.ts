'use server';

import { cookies } from 'next/headers';
import {
  SandboxRemoteDataSourceImpl,
  SandboxRepositoryImpl,
} from '@learning-hub/data';
import {
  ExecuteCodeParams,
  ExecuteCodeUsecase,
  GetExecutionHistoryUsecase,
} from '@learning-hub/domain';

async function getRepo() {
  const token = (await cookies()).get('accessToken')?.value ?? '';
  return new SandboxRepositoryImpl(new SandboxRemoteDataSourceImpl(), token);
}

export async function executeCodeAction(params: ExecuteCodeParams) {
  const repo = await getRepo();
  const usecase = new ExecuteCodeUsecase(repo);
  const result = await usecase.execute(params);
  if (result.type === 'right') {
    return { success: true, data: result.value };
  }
  return { success: false, error: result.value.message };
}

export async function getExecutionHistoryAction(limit?: number) {
  const repo = await getRepo();
  const usecase = new GetExecutionHistoryUsecase(repo);
  const result = await usecase.execute(limit ? { limit } : undefined);
  if (result.type === 'right') {
    return { success: true, data: result.value };
  }
  return { success: false, error: result.value.message };
}
