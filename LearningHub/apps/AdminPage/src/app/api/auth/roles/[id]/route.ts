import { NextRequest, NextResponse } from 'next/server';
import {
  AuthRemoteDataSourceImpl,
  AuthRepositoryImpl,
} from '@learning-hub/data';
import { UpdateRoleUsecase, DeleteRoleUsecase } from '@learning-hub/domain';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = req.headers.get('authorization')?.split(' ')[1];
  const body = await req.json();
  const dataSource = new AuthRemoteDataSourceImpl();
  const repository = new AuthRepositoryImpl(dataSource, token || undefined);
  const usecase = new UpdateRoleUsecase(repository);
  const result = await usecase.execute({ id: parseInt(id), data: body });
  return result.type === 'right'
    ? NextResponse.json({ status: 200, data: result.value })
    : NextResponse.json({ status: 500, error: result.value.message });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = req.headers.get('authorization')?.split(' ')[1];
  const dataSource = new AuthRemoteDataSourceImpl();
  const repository = new AuthRepositoryImpl(dataSource, token || undefined);
  const usecase = new DeleteRoleUsecase(repository);
  const result = await usecase.execute({ id: parseInt(id) });
  return result.type === 'right'
    ? NextResponse.json({ status: 200, success: true })
    : NextResponse.json({ status: 500, error: result.value.message });
}
