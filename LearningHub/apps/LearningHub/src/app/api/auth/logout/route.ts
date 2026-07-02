import { NextRequest, NextResponse } from 'next/server';
import {
  AuthRemoteDataSourceImpl,
  AuthRepositoryImpl,
} from '@learning-hub/data';
import { LogoutUsecase } from '@learning-hub/domain';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const body = await req.json();
  const dataSource = new AuthRemoteDataSourceImpl();
  const repository = new AuthRepositoryImpl(dataSource, token || undefined);
  const usecase = new LogoutUsecase(repository);
  const result = await usecase.execute({ refreshToken: body.refreshToken });
  return result.type === 'right'
    ? NextResponse.json({ status: 200, success: true })
    : NextResponse.json({ status: 500, error: result.value.message });
}
