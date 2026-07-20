'use server';
import { GetProfileUsecase, type LoginParams } from '@learning-hub/domain';
import {
  serverAdminLogin,
  serverRefresh,
  serverLogout,
} from '@learning-hub/data/server';
import {
  AuthRemoteDataSourceImpl,
  AuthRepositoryImpl,
} from '@learning-hub/data';
import { cookies } from 'next/headers';

export type AdminLoginResult =
  | { success: true; accessToken: string; refreshToken: string }
  | { success: false; error: string };

export async function adminLoginAction(
  data: LoginParams,
): Promise<AdminLoginResult> {
  try {
    const result = await serverAdminLogin(data.email, data.password);
    return {
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  } catch (e: unknown) {
    const err = e as Error;
    return { success: false, error: err?.message || 'Login failed' };
  }
}

export async function refreshAdminTokenAction(): Promise<
  | { success: true; accessToken: string; refreshToken: string }
  | { success: false; error: string }
> {
  try {
    const result = await serverRefresh();
    return {
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  } catch (e: unknown) {
    const err = e as Error;
    return { success: false, error: err?.message || 'Refresh failed' };
  }
}

export async function adminLogoutAction(): Promise<void> {
  await serverLogout();
}

export async function checkAdminAuth(): Promise<boolean> {
  const store = await cookies();
  const accessToken = store.get('accessToken')?.value;
  if (!accessToken) return false;
  try {
    const repo = new AuthRepositoryImpl(new AuthRemoteDataSourceImpl());
    const result = await new GetProfileUsecase(repo).execute({});
    return result.type === 'right';
  } catch {
    return false;
  }
}

export async function getSocketToken(): Promise<string> {
  const store = await cookies();
  return store.get('accessToken')?.value ?? '';
}
