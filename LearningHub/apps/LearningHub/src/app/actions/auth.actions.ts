'use server';

import type { RegisterParams, User } from '@learning-hub/domain';
import {
  AuthRemoteDataSourceImpl,
  AuthRepositoryImpl,
} from '@learning-hub/data';
import { RegisterUsecase } from '@learning-hub/domain';
import { serverLogin, serverLogout } from '@learning-hub/data/server';
import { cookies } from 'next/headers';
import axios from 'axios';

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
    const NEST_API = process.env.NEST_API_URL || 'http://localhost:8080';
    const res = await axios.get(`${NEST_API}/auth/me`, {
      headers: { Cookie: `accessToken=${accessToken}` },
    });
    return res.data?.user ?? null;
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
