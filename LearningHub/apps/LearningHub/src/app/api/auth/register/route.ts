import { NextRequest, NextResponse } from 'next/server';
import { AuthRemoteDataSourceImpl, AuthRepositoryImpl } from '@learning-hub/data';
import { RegisterUsecase } from '@learning-hub/domain';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const dataSource = new AuthRemoteDataSourceImpl();
    const repository = new AuthRepositoryImpl(dataSource);
    const usecase = new RegisterUsecase(repository);
    const result = await usecase.execute(body);
    return result.type === 'right'
        ? NextResponse.json({ status: 201, data: result.value })
        : NextResponse.json({ status: 400, error: result.value.message });
}
