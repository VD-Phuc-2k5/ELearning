import { cookies } from 'next/headers';
import { AuthRemoteDataSourceImpl, AuthRepositoryImpl } from './lib/auth';
import {
  LoginUsecase,
  AdminLoginUsecase,
  RefreshTokenUsecase,
  LogoutUsecase,
} from '@learning-hub/domain';

async function setCookies(accessToken: string, refreshToken: string) {
  const jar = await cookies();
  jar.set('accessToken', accessToken, {
    maxAge: 86400,
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
  });
  jar.set('refreshToken', refreshToken, {
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
  });
}

async function clearCookies() {
  const jar = await cookies();
  jar.delete('accessToken');
  jar.delete('refreshToken');
}

export async function serverLogin(email: string, password: string) {
  const repo = new AuthRepositoryImpl(new AuthRemoteDataSourceImpl());
  const result = await new LoginUsecase(repo).execute({
    email,
    password,
    rejectAdminRole: true,
  } as any);
  if (result.type === 'right') {
    await setCookies(result.value.accessToken, result.value.refreshToken);
    return result.value;
  }
  throw result.value;
}

export async function serverAdminLogin(email: string, password: string) {
  const repo = new AuthRepositoryImpl(new AuthRemoteDataSourceImpl());
  const result = await new AdminLoginUsecase(repo).execute({
    email,
    password,
  });
  if (result.type === 'right') {
    await setCookies(result.value.accessToken, result.value.refreshToken);
    return result.value;
  }
  throw result.value;
}

export async function serverLogout() {
  const refreshToken = (await cookies()).get('refreshToken')?.value;
  if (refreshToken) {
    const repo = new AuthRepositoryImpl(new AuthRemoteDataSourceImpl());
    await new LogoutUsecase(repo).execute({ refreshToken });
  }
  await clearCookies();
}

export async function serverRefresh(): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const refreshToken = (await cookies()).get('refreshToken')?.value;
  if (!refreshToken) throw new Error('No refresh token');
  const repo = new AuthRepositoryImpl(new AuthRemoteDataSourceImpl());
  const result = await new RefreshTokenUsecase(repo).execute(refreshToken);
  if (result.type === 'right') {
    await setCookies(result.value.accessToken, result.value.refreshToken);
    return result.value;
  }
  throw result.value;
}
