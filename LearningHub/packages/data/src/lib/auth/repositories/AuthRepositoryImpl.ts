import {
  Either,
  Failure,
  right,
  left,
  UnknownFailure,
  AuthenticationFailure,
  PermissionFailure,
  NotFoundFailure,
  NetworkFailure,
  AuthenticationException,
  PermissionException,
  NotFoundException,
  NetworkException,
} from '@learning-hub/core';
import {
  AuthTokens,
  CreatePermissionParams,
  CreateRoleParams,
  GrantPermissionParams,
  IAuthRepository,
  LoginParams,
  Permission,
  RegisterParams,
  Role,
  UpdateAdminParams,
  UpdateRoleParams,
  User,
} from '@learning-hub/domain';
import { IAuthRemoteDataSource } from '../datasources/IAuthRemoteDataSource';

function toFailure(e: unknown): Failure {
  if (e instanceof AuthenticationException)
    return new AuthenticationFailure(e.message);
  if (e instanceof PermissionException) return new PermissionFailure();
  if (e instanceof NotFoundException) return new NotFoundFailure();
  if (e instanceof NetworkException) return new NetworkFailure();
  return new UnknownFailure();
}

export class AuthRepositoryImpl implements IAuthRepository {
  constructor(
    private dataSource: IAuthRemoteDataSource,
    private token?: string,
  ) {}

  async register(data: RegisterParams): Promise<Either<Failure, User>> {
    try {
      const res = await this.dataSource.register(data);
      return right(res.user);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async login(data: LoginParams): Promise<Either<Failure, AuthTokens>> {
    try {
      return right(await this.dataSource.login(data));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async adminLogin(data: LoginParams): Promise<Either<Failure, AuthTokens>> {
    try {
      return right(await this.dataSource.adminLogin(data));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async registerAdmin(data: RegisterParams): Promise<Either<Failure, User>> {
    try {
      const res = await this.dataSource.registerAdmin(data, this.token);
      return right(res.user);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async updateUser(
    id: string,
    data: UpdateAdminParams,
  ): Promise<Either<Failure, User>> {
    try {
      return right(await this.dataSource.updateUser(id, data, this.token));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async deleteUser(id: string): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.deleteUser(id, this.token);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async searchUsersByEmail(email: string): Promise<Either<Failure, User[]>> {
    try {
      return right(await this.dataSource.searchUsersByEmail(email, this.token));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async refreshToken(token: string): Promise<Either<Failure, AuthTokens>> {
    try {
      return right(await this.dataSource.refreshToken({ refreshToken: token }));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async logout(): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.logout(this.token);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getProfile(): Promise<Either<Failure, User>> {
    try {
      return right(await this.dataSource.getProfile(this.token));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getUsers(): Promise<Either<Failure, User[]>> {
    try {
      return right(await this.dataSource.getUsers(this.token));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getRoles(): Promise<Either<Failure, Role[]>> {
    try {
      return right(await this.dataSource.getRoles(this.token));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async createRole(data: CreateRoleParams): Promise<Either<Failure, Role>> {
    try {
      return right(await this.dataSource.createRole(data, this.token));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async updateRole(
    id: number,
    data: UpdateRoleParams,
  ): Promise<Either<Failure, Role>> {
    try {
      return right(await this.dataSource.updateRole(id, data, this.token));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async deleteRole(id: number): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.deleteRole(id, this.token);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getPermissions(): Promise<Either<Failure, Permission[]>> {
    try {
      return right(await this.dataSource.getPermissions(this.token));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getResources(): Promise<Either<Failure, string[]>> {
    try {
      const data = await this.dataSource.getResources(this.token);
      return right(data.resources);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async createPermission(
    data: CreatePermissionParams,
  ): Promise<Either<Failure, Permission>> {
    try {
      return right(await this.dataSource.createPermission(data, this.token));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async deletePermission(id: number): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.deletePermission(id, this.token);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getRolePermissions(roleId: number): Promise<Either<Failure, number[]>> {
    try {
      const data = await this.dataSource.getRolePermissions(roleId, this.token);
      return right(data.map((p) => p.id));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async assignPermissionToRole(
    roleId: number,
    permissionId: number,
  ): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.assignPermission(roleId, permissionId, this.token);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async removePermissionFromRole(
    roleId: number,
    permissionId: number,
  ): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.removePermission(roleId, permissionId, this.token);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getUserRoles(userId: string): Promise<Either<Failure, Role[]>> {
    try {
      return right(await this.dataSource.getUserRoles(userId, this.token));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async assignRoleToUser(
    userId: string,
    roleId: number,
  ): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.assignRoleToUser(userId, roleId, this.token);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async removeRoleFromUser(
    userId: string,
    roleId: number,
  ): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.removeRoleFromUser(userId, roleId, this.token);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getUserPermissions(
    userId: string,
  ): Promise<Either<Failure, Permission[]>> {
    try {
      return right(
        await this.dataSource.getUserPermissions(userId, this.token),
      );
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async grantUserPermission(
    userId: string,
    data: GrantPermissionParams,
  ): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.grantUserPermission(userId, data, this.token);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async revokeUserPermission(
    userId: string,
    permissionId: number,
  ): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.revokeUserPermission(
        userId,
        permissionId,
        this.token,
      );
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }
}
