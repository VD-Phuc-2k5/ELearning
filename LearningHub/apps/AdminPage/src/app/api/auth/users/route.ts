import { NextRequest, NextResponse } from 'next/server';
import { AuthRemoteDataSourceImpl, AuthRepositoryImpl } from '@learning-hub/data';
import { GetUsersUsecase } from '@learning-hub/domain';

export async function GET(req: NextRequest) {
    const token = req.headers.get('authorization')?.split(' ')[1];

    // Composition Root
    const dataSource = new AuthRemoteDataSourceImpl();
    const repository = new AuthRepositoryImpl(dataSource, token || undefined);
    const usecase = new GetUsersUsecase(repository);

    const result = await usecase.execute({});

    if (result.type === 'right') {
        return NextResponse.json({ status: 200, data: result.value });
    } else {
        return NextResponse.json({ status: 500, error: result.value.message });
    }
}
