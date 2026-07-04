'use server';
import type { LoginParams } from '@learning-hub/domain';
import {
  serverAdminLogin,
  serverRefresh,
  serverLogout,
} from '@learning-hub/data/server';

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
