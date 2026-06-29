'use server';
import {
  AuthRemoteDataSourceImpl,
  AuthRepositoryImpl,
} from '@learning-hub/data';
import { AdminLoginUsecase } from '@learning-hub/domain';
import { cookies } from 'next/headers';

export async function adminLoginAction(data: {
  email: string;
  password: string;
}): Promise<
  { success: true; accessToken: string } | { success: false; error: string }
> {
  const ds = new AuthRemoteDataSourceImpl();
  const repo = new AuthRepositoryImpl(ds, '');
  const result = await new AdminLoginUsecase(repo).execute(data);
  if (result.type === 'right') {
    (await cookies()).set('adminToken', result.value.accessToken, {
      maxAge: 900,
      path: '/',
      sameSite: 'lax',
    });
    return { success: true, accessToken: result.value.accessToken };
  }
  return { success: false, error: result.value.message };
}
