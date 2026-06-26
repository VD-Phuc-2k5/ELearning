import { NextRequest, NextResponse } from 'next/server';
import {
  AuthRemoteDataSourceImpl,
  AuthRepositoryImpl,
} from '@learning-hub/data';
import {
  GetUserPermissionsUsecase,
  GrantUserPermissionUsecase,
} from '@learning-hub/domain';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = req.headers.get('authorization')?.split(' ')[1];
  const dataSource = new AuthRemoteDataSourceImpl();
  const repository = new AuthRepositoryImpl(dataSource, token || undefined);
  const usecase = new GetUserPermissionsUsecase(repository);
  const result = await usecase.execute({ userId: id });
  return result.type === 'right'
    ? NextResponse.json({ status: 200, data: result.value })
    : NextResponse.json({ status: 500, error: result.value.message });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = req.headers.get('authorization')?.split(' ')[1];
  const body = await req.json();
  const dataSource = new AuthRemoteDataSourceImpl();
  const repository = new AuthRepositoryImpl(dataSource, token || undefined);
  const usecase = new GrantUserPermissionUsecase(repository);
  const result = await usecase.execute({ userId: id, ...body });
  return result.type === 'right'
    ? NextResponse.json({ status: 200, success: true })
    : NextResponse.json({ status: 500, error: result.value.message });
}
