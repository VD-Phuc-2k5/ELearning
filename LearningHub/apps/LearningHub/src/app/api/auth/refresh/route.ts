import { NextRequest, NextResponse } from 'next/server';
import {
  AuthRemoteDataSourceImpl,
  AuthRepositoryImpl,
} from '@learning-hub/data';
import { RefreshTokenUsecase } from '@learning-hub/domain';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const dataSource = new AuthRemoteDataSourceImpl();
  const repository = new AuthRepositoryImpl(dataSource);
  const usecase = new RefreshTokenUsecase(repository);
  const result = await usecase.execute(body.refreshToken);
  if (result.type === 'right') {
    const res = NextResponse.json(result.value);
    res.cookies.set('accessToken', result.value.accessToken, {
      maxAge: 900,
      path: '/',
      sameSite: 'lax',
    });
    return res;
  }
  return NextResponse.json({ error: result.value.message }, { status: 401 });
}
