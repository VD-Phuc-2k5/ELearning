'use server';
import {
  AuthRemoteDataSourceImpl,
  AuthRepositoryImpl,
} from '@learning-hub/data';
import type { LoginParams } from '@learning-hub/domain';
import {
  AdminLoginUsecase,
  LogoutUsecase,
  RefreshTokenUsecase,
} from '@learning-hub/domain';
import { cookies } from 'next/headers';

export type AdminLoginResult =
  | { success: true; accessToken: string; refreshToken: string }
  | { success: false; error: string };

export async function adminLoginAction(
  data: LoginParams,
): Promise<AdminLoginResult> {
  const ds = new AuthRemoteDataSourceImpl();
  const repo = new AuthRepositoryImpl(ds, '');
  const result = await new AdminLoginUsecase(repo).execute(data);
  if (result.type === 'right') {
    const cookieStore = await cookies();
    cookieStore.set('adminToken', result.value.accessToken, {
      maxAge: 900,
      path: '/',
      sameSite: 'lax',
    });
    cookieStore.set('adminRefreshToken', result.value.refreshToken, {
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
      sameSite: 'lax',
    });
    return {
      success: true,
      accessToken: result.value.accessToken,
      refreshToken: result.value.refreshToken,
    };
  }
  return { success: false, error: result.value.message };
}

export async function refreshAdminTokenAction(): Promise<
  | { success: true; accessToken: string; refreshToken: string }
  | { success: false; error: string }
> {
  const refreshToken = (await cookies()).get('adminRefreshToken')?.value;
  if (!refreshToken) {
    return { success: false, error: 'Không tìm thấy refresh token' };
  }
  const ds = new AuthRemoteDataSourceImpl();
  const repo = new AuthRepositoryImpl(ds);
  const result = await new RefreshTokenUsecase(repo).execute(refreshToken);
  if (result.type === 'right') {
    const cookieStore = await cookies();
    cookieStore.set('adminToken', result.value.accessToken, {
      maxAge: 900,
      path: '/',
      sameSite: 'lax',
    });
    cookieStore.set('adminRefreshToken', result.value.refreshToken, {
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
      sameSite: 'lax',
    });
    return {
      success: true,
      accessToken: result.value.accessToken,
      refreshToken: result.value.refreshToken,
    };
  }
  return { success: false, error: result.value.message };
}

export async function adminLogoutAction(): Promise<void> {
  const refreshToken = (await cookies()).get('adminRefreshToken')?.value;
  if (refreshToken) {
    const ds = new AuthRemoteDataSourceImpl();
    const repo = new AuthRepositoryImpl(ds);
    await new LogoutUsecase(repo).execute({ refreshToken });
  }
  const cookieStore = await cookies();
  cookieStore.delete('adminToken');
  cookieStore.delete('adminRefreshToken');
}
