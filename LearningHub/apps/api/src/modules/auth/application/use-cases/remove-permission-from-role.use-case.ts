import { Inject, Injectable } from '@nestjs/common';
import { Either, Failure, Usecase, left, right } from '@learning-hub/core';
import { IRoleRepository } from '../../domain/repositories/i-role.repository';
import { IRolePermissionRepository } from '../../domain/repositories/i-role-permission.repository';
import { IUserRoleRepository } from '../../domain/repositories/i-user-role.repository';
import { IPermissionResolverService } from '../interfaces/i-permission-resolver.service';
import { AuthFailures } from '../../domain/errors/auth.failures';

export interface RemovePermissionFromRoleParams {
  roleId: number;
  permissionId: number;
}

export interface RemovePermissionFromRoleResult {
  success: true;
}

@Injectable()
export class RemovePermissionFromRoleUseCase
  implements
    Usecase<RemovePermissionFromRoleResult, RemovePermissionFromRoleParams>
{
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepo: IRoleRepository,
    @Inject('IRolePermissionRepository')
    private readonly rolePermissionRepo: IRolePermissionRepository,
    @Inject('IUserRoleRepository')
    private readonly userRoleRepo: IUserRoleRepository,
    @Inject('IPermissionResolverService')
    private readonly permissionResolver: IPermissionResolverService,
  ) {}

  async execute(
    params: RemovePermissionFromRoleParams,
  ): Promise<Either<Failure, RemovePermissionFromRoleResult>> {
    const role = await this.roleRepo.findById(params.roleId);
    if (!role) return left(AuthFailures.roleNotFound());
    await this.rolePermissionRepo.remove(params.roleId, params.permissionId);
    const userIds = await this.userRoleRepo.findUserIdsByRoleId(params.roleId);
    userIds.forEach((uid) => this.permissionResolver.invalidate(uid));
    return right({ success: true as const });
  }
}
