'use server';

import type { RegisterParams, User } from '@learning-hub/domain';
import {
  AuthRemoteDataSourceImpl,
  AuthRepositoryImpl,
} from '@learning-hub/data';
import { RegisterUsecase } from '@learning-hub/domain';
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
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString(),
    );
    return {
      id: payload.sub ?? '',
      email: payload.email ?? '',
      username: payload.username ?? '',
    };
  } catch {
    return null;
  }
}

export async function logoutAction(): Promise<void> {
  await serverLogout();
}

export async function registerAction(
  data: RegisterParams,
): Promise<{ success: true } | { success: false; error: string }> {
  const repo = new AuthRepositoryImpl(new AuthRemoteDataSourceImpl());
  const result = await new RegisterUsecase(repo).execute(data);
  if (result.type === 'right') return { success: true };
  return { success: false, error: result.value.message };
}
