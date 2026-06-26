import { NextRequest, NextResponse } from 'next/server';
import { AuthRemoteDataSourceImpl, AuthRepositoryImpl } from '@learning-hub/data';
import { LoginUsecase, AdminLoginUsecase } from '@learning-hub/domain';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const dataSource = new AuthRemoteDataSourceImpl();
    const repository = new AuthRepositoryImpl(dataSource);

    const usecase = body.isAdmin ? new AdminLoginUsecase(repository) : new LoginUsecase(repository);
    const result = await usecase.execute(body);

    return result.type === 'right'
        ? NextResponse.json({ status: 200, ...result.value })
        : NextResponse.json({ status: 401, error: result.value.message });
}
