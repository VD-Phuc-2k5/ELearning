import { Either, Failure, right, left, UnknownFailure } from '@learning-hub/core';
import { AuthTokens, CreatePermissionParams, CreateRoleParams, GrantPermissionParams, IAuthRepository, LoginParams, Permission, RegisterParams, Role, UpdateRoleParams, User } from '@learning-hub/domain';
import { IAuthRemoteDataSource } from '../datasources/AuthRemoteDataSourceImpl';

export class AuthRepositoryImpl implements IAuthRepository {
    constructor(private dataSource: IAuthRemoteDataSource, private token?: string) { }

    async register(data: RegisterParams): Promise<Either<Failure, User>> {
        try {
            const res = await (this.dataSource as any).register(data);
            return right(res.user);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async login(data: LoginParams): Promise<Either<Failure, AuthTokens>> {
        try {
            const res = await (this.dataSource as any).login(data);
            return right(res as AuthTokens);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async adminLogin(data: LoginParams): Promise<Either<Failure, AuthTokens>> {
        try {
            const res = await (this.dataSource as any).adminLogin(data);
            return right(res as AuthTokens);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async registerAdmin(data: RegisterParams): Promise<Either<Failure, User>> {
        try {
            const res = await (this.dataSource as any).registerAdmin(data, this.token);
            return right(res.user);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async refreshToken(token: string): Promise<Either<Failure, AuthTokens>> {
        try {
            const res = await (this.dataSource as any).refreshToken({ refreshToken: token });
            return right(res as AuthTokens);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async logout(): Promise<Either<Failure, void>> {
        try {
            await (this.dataSource as any).logout(this.token);
            return right(undefined);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async getProfile(): Promise<Either<Failure, User>> {
        try {
            const res = await (this.dataSource as any).getProfile(this.token);
            return right(res as AuthTokens);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async getUsers(): Promise<Either<Failure, User[]>> {
        try {
            const data = await (this.dataSource as any).getUsers(this.token);
            return right(data);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async getRoles(): Promise<Either<Failure, Role[]>> {
        try {
            const data = await (this.dataSource as any).getRoles(this.token);
            return right(data as Role[]);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async createRole(data: CreateRoleParams): Promise<Either<Failure, Role>> {
        try {
            const res = await (this.dataSource as any).createRole(data, this.token);
            return right(res as AuthTokens);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async updateRole(id: number, data: UpdateRoleParams): Promise<Either<Failure, Role>> {
        try {
            const res = await (this.dataSource as any).updateRole(id, data, this.token);
            return right(res as AuthTokens);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async deleteRole(id: number): Promise<Either<Failure, void>> {
        try {
            await (this.dataSource as any).deleteRole(id, this.token);
            return right(undefined);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async getPermissions(): Promise<Either<Failure, Permission[]>> {
        try {
            const data = await (this.dataSource as any).getPermissions(this.token);
            return right(data as Permission[]);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async getResources(): Promise<Either<Failure, string[]>> {
        try {
            const data = await (this.dataSource as any).getResources(this.token);
            return right(data.resources);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async createPermission(data: CreatePermissionParams): Promise<Either<Failure, Permission>> {
        try {
            const res = await (this.dataSource as any).createPermission(data, this.token);
            return right(res as AuthTokens);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async deletePermission(id: number): Promise<Either<Failure, void>> {
        try {
            await (this.dataSource as any).deletePermission(id, this.token);
            return right(undefined);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async getRolePermissions(roleId: number): Promise<Either<Failure, number[]>> {
        try {
            const data = await (this.dataSource as any).getRolePermissions(roleId, this.token);
            return right(data.map((rp: { permissionId: number }) => rp.permissionId));
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async assignPermissionToRole(roleId: number, permissionId: number): Promise<Either<Failure, void>> {
        try {
            await (this.dataSource as any).assignPermission(roleId, permissionId, this.token);
            return right(undefined);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async removePermissionFromRole(roleId: number, permissionId: number): Promise<Either<Failure, void>> {
        try {
            await (this.dataSource as any).removePermission(roleId, permissionId, this.token);
            return right(undefined);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async getUserRoles(userId: string): Promise<Either<Failure, Role[]>> {
        try {
            const res = await (this.dataSource as any).getUserRoles(userId, this.token);
            return right(res as AuthTokens);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async assignRoleToUser(userId: string, roleId: number): Promise<Either<Failure, void>> {
        try {
            await (this.dataSource as any).assignRoleToUser(userId, roleId, this.token);
            return right(undefined);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async removeRoleFromUser(userId: string, roleId: number): Promise<Either<Failure, void>> {
        try {
            await (this.dataSource as any).removeRoleFromUser(userId, roleId, this.token);
            return right(undefined);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async getUserPermissions(userId: string): Promise<Either<Failure, Permission[]>> {
        try {
            const res = await (this.dataSource as any).getUserPermissions(userId, this.token);
            return right(res as AuthTokens);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async grantUserPermission(userId: string, data: GrantPermissionParams): Promise<Either<Failure, void>> {
        try {
            await (this.dataSource as any).grantUserPermission(userId, data, this.token);
            return right(undefined);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }

    async revokeUserPermission(userId: string, permissionId: number): Promise<Either<Failure, void>> {
        try {
            await (this.dataSource as any).revokeUserPermission(userId, permissionId, this.token);
            return right(undefined);
        } catch (e) {
            return left(new UnknownFailure());
        }
    }
}
