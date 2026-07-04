'use server';
import type { LoginParams } from '@learning-hub/domain';
import {
  serverAdminLogin,
  serverRefresh,
  serverLogout,
} from '@learning-hub/data/server';
import { cookies } from 'next/headers';
import axios from 'axios';

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
  } catch (e: any) {
    return { success: false, error: e?.message || 'Login failed' };
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
  } catch (e: any) {
    return { success: false, error: e?.message || 'Refresh failed' };
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
    const NEST_API = process.env.NEST_API_URL || 'http://localhost:8080';
    await axios.get(`${NEST_API}/auth/me`, {
      headers: { Cookie: `accessToken=${accessToken}` },
    });
    return true;
  } catch {
    return false;
  }
}

export async function getSocketToken(): Promise<string> {
  const store = await cookies();
  return store.get('accessToken')?.value ?? '';
}
