'use server';

import {
  AuthRemoteDataSourceImpl,
  AuthRepositoryImpl,
} from '@learning-hub/data';
import type { RegisterParams, User } from '@learning-hub/domain';
import {
  LoginUsecase,
  LogoutUsecase,
  RegisterUsecase,
} from '@learning-hub/domain';
import { cookies } from 'next/headers';

export async function loginAction(data: {
  email: string;
  password: string;
}): Promise<
  | { success: true; accessToken: string; refreshToken: string }
  | { success: false; error: string }
> {
  const repo = new AuthRepositoryImpl(new AuthRemoteDataSourceImpl());
  const result = await new LoginUsecase(repo).execute(data);
  if (result.type === 'right') {
    const jar = await cookies();
    jar.set('accessToken', result.value.accessToken, {
      maxAge: 900,
      path: '/',
      sameSite: 'lax',
    });
    jar.set('refreshToken', result.value.refreshToken, {
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
    });
    return {
      success: true,
      accessToken: result.value.accessToken,
      refreshToken: result.value.refreshToken,
    };
  }
  return { success: false, error: result.value.message };
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token =
    cookieStore.get('accessToken')?.value ??
    cookieStore.get('adminToken')?.value;
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
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;
  if (refreshToken) {
    const repo = new AuthRepositoryImpl(new AuthRemoteDataSourceImpl());
    await new LogoutUsecase(repo).execute({ refreshToken });
  }
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
}

export async function registerAction(
  data: RegisterParams,
): Promise<{ success: true } | { success: false; error: string }> {
  const repo = new AuthRepositoryImpl(new AuthRemoteDataSourceImpl());
  const result = await new RegisterUsecase(repo).execute(data);
  if (result.type === 'right') return { success: true };
  return { success: false, error: result.value.message };
}
