import { NextRequest, NextResponse } from 'next/server';
import { AuthRemoteDataSourceImpl, AuthRepositoryImpl } from '@learning-hub/data';
import { GetRolesUsecase, GetPermissionsUsecase } from '@learning-hub/domain';

export async function GET(req: NextRequest) {
    const token = req.headers.get('authorization')?.split(' ')[1];

    const dataSource = new AuthRemoteDataSourceImpl();
    const repository = new AuthRepositoryImpl(dataSource, token || undefined);

    const getRoles = new GetRolesUsecase(repository);
    const getPermissions = new GetPermissionsUsecase(repository);

    const [rolesRes, permsRes] = await Promise.all([
        getRoles.execute({}),
        getPermissions.execute({}),
    ]);

    if (rolesRes.type === 'right' && permsRes.type === 'right') {
        const roles = rolesRes.value;
        const permissions = permsRes.value;

        // Fetch mapping for each role
        const matrix: Record<number, number[]> = {};
        for (const role of roles) {
            const mapping = await repository.getRolePermissions(role.id);
            if (mapping.type === 'right') {
                matrix[role.id] = mapping.value;
            }
        }

        return NextResponse.json({ status: 200, roles, permissions, matrix });
    }

    return NextResponse.json({ status: 500, error: 'Failed to fetch matrix data' });
}
