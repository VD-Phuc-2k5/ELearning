import { NextRequest, NextResponse } from 'next/server';
import { AuthRemoteDataSourceImpl, AuthRepositoryImpl } from '@learning-hub/data';
import { RefreshTokenUsecase } from '@learning-hub/domain';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const dataSource = new AuthRemoteDataSourceImpl();
    const repository = new AuthRepositoryImpl(dataSource);
    const usecase = new RefreshTokenUsecase(repository);
    const result = await usecase.execute(body.refreshToken);
    return result.type === 'right'
        ? NextResponse.json(result.value)
        : NextResponse.json({ error: result.value.message }, { status: 401 });
}
