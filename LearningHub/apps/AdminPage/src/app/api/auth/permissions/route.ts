import { NextRequest, NextResponse } from 'next/server';
import { AuthRemoteDataSourceImpl, AuthRepositoryImpl } from '@learning-hub/data';
import { GetPermissionsUsecase, GetResourcesUsecase, CreatePermissionUsecase } from '@learning-hub/domain';

export async function GET(req: NextRequest) {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const dataSource = new AuthRemoteDataSourceImpl();
    const repository = new AuthRepositoryImpl(dataSource, token || undefined);

    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get('mode');

    if (mode === 'resources') {
        const usecase = new GetResourcesUsecase(repository);
        const result = await usecase.execute({});
        return result.type === 'right'
            ? NextResponse.json({ status: 200, resources: result.value })
            : NextResponse.json({ status: 500, error: result.value.message });
    }

    const usecase = new GetPermissionsUsecase(repository);
    const result = await usecase.execute({});
    return result.type === 'right'
        ? NextResponse.json({ status: 200, data: result.value })
        : NextResponse.json({ status: 500, error: result.value.message });
}

export async function POST(req: NextRequest) {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const body = await req.json();
    const dataSource = new AuthRemoteDataSourceImpl();
    const repository = new AuthRepositoryImpl(dataSource, token || undefined);
    const usecase = new CreatePermissionUsecase(repository);
    const result = await usecase.execute(body);
    return result.type === 'right'
        ? NextResponse.json({ status: 201, data: result.value })
        : NextResponse.json({ status: 500, error: result.value.message });
}
