'use server';

import {
  RegisterUsecase,
  GetProfileUsecase,
  type RegisterParams,
  type User,
} from '@learning-hub/domain';
import {
  AuthRemoteDataSourceImpl,
  AuthRepositoryImpl,
} from '@learning-hub/data';
import { serverLogin, serverLogout } from '@learning-hub/data/server';
import { cookies } from 'next/headers';

export async function loginAction(data: {
  email: string;
  password: string;
}): Promise<
  | { success: true; accessToken: string; refreshToken: string }
  | { success: false; error: string }
> {
  try {
    const result = await serverLogin(data.email, data.password);
    return {
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Login failed' };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const accessToken = store.get('accessToken')?.value;
  if (!accessToken) return null;
  try {
    const repo = new AuthRepositoryImpl(new AuthRemoteDataSourceImpl());
    const result = await new GetProfileUsecase(repo).execute({});
    if (result.type === 'right') {
      return result.value;
    }
    return null;
  } catch {
    return null;
  }
}

export async function logoutAction(): Promise<void> {
  await serverLogout();
}

export async function getSocketToken(): Promise<string> {
  const store = await cookies();
  return store.get('accessToken')?.value ?? '';
}

export async function registerAction(
  data: RegisterParams,
): Promise<{ success: true } | { success: false; error: string }> {
  const repo = new AuthRepositoryImpl(new AuthRemoteDataSourceImpl());
  const result = await new RegisterUsecase(repo).execute(data);
  if (result.type === 'right') return { success: true };
  return { success: false, error: result.value.message };
}
