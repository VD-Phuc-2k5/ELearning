import { NextRequest, NextResponse } from 'next/server';
import {
  AuthRemoteDataSourceImpl,
  AuthRepositoryImpl,
} from '@learning-hub/data';
import { LoginUsecase } from '@learning-hub/domain';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const dataSource = new AuthRemoteDataSourceImpl();
  const repository = new AuthRepositoryImpl(dataSource);
  const usecase = new LoginUsecase(repository);
  const result = await usecase.execute(body);
  if (result.type === 'right') {
    const res = NextResponse.json({ status: 200, ...result.value });
    res.cookies.set('accessToken', result.value.accessToken, {
      maxAge: 900,
      path: '/',
      sameSite: 'lax',
    });
    return res;
  }
  return NextResponse.json({ status: 401, error: result.value.message });
}
