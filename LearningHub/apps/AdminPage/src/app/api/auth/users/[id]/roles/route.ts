import { NextRequest, NextResponse } from 'next/server';
import {
  AuthRemoteDataSourceImpl,
  AuthRepositoryImpl,
} from '@learning-hub/data';
import {
  GetUserRolesUsecase,
  AssignRoleToUserUsecase,
  RemoveRoleFromUserUsecase,
} from '@learning-hub/domain';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = req.headers.get('authorization')?.split(' ')[1];
  const dataSource = new AuthRemoteDataSourceImpl();
  const repository = new AuthRepositoryImpl(dataSource, token || undefined);
  const usecase = new GetUserRolesUsecase(repository);
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
  const usecase = new AssignRoleToUserUsecase(repository);
  const result = await usecase.execute({ userId: id, roleId: body.roleId });
  return result.type === 'right'
    ? NextResponse.json({ status: 200, success: true })
    : NextResponse.json({ status: 500, error: result.value.message });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = req.headers.get('authorization')?.split(' ')[1];
  const { searchParams } = new URL(req.url);
  const roleId = searchParams.get('roleId');
  const dataSource = new AuthRemoteDataSourceImpl();
  const repository = new AuthRepositoryImpl(dataSource, token || undefined);
  const usecase = new RemoveRoleFromUserUsecase(repository);
  const result = await usecase.execute({
    userId: id,
    roleId: parseInt(roleId || '0'),
  });
  return result.type === 'right'
    ? NextResponse.json({ status: 200, success: true })
    : NextResponse.json({ status: 500, error: result.value.message });
}
