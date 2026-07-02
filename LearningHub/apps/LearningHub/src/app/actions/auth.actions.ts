'use server';

import {
  AuthRemoteDataSourceImpl,
  AuthRepositoryImpl,
} from '@learning-hub/data';
import type { RegisterParams } from '@learning-hub/domain';
import {
  LoginUsecase,
  LogoutUsecase,
  RegisterUsecase,
  ForgotPasswordUsecase,
  ResetPasswordUsecase,
  VerifyResetTokenUsecase,
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

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const repo = new AuthRepositoryImpl(new AuthRemoteDataSourceImpl(), token);
  await new LogoutUsecase(repo).execute({});
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

export async function forgotPasswordAction(
  email: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const repo = new AuthRepositoryImpl(new AuthRemoteDataSourceImpl());
  const result = await new ForgotPasswordUsecase(repo).execute({ email });
  if (result.type === 'right') return { success: true };
  return { success: false, error: result.value.message };
}

export async function resetPasswordAction(data: {
  token: string;
  newPassword: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const repo = new AuthRepositoryImpl(new AuthRemoteDataSourceImpl());
  const result = await new ResetPasswordUsecase(repo).execute(data);
  if (result.type === 'right') return { success: true };
  return { success: false, error: result.value.message };
}

export async function verifyResetTokenAction(
  token: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const repo = new AuthRepositoryImpl(new AuthRemoteDataSourceImpl());
  const result = await new VerifyResetTokenUsecase(repo).execute({ token });
  if (result.type === 'right') return { success: true };
  return { success: false, error: result.value.message };
}
