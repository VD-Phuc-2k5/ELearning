import { Inject, Injectable } from '@nestjs/common';
import { Either, Failure, Usecase, left, right } from '@learning-hub/core';
import { IRoleRepository } from '../../domain/repositories/i-role.repository';
import { IPermissionRepository } from '../../domain/repositories/i-permission.repository';
import { IRolePermissionRepository } from '../../domain/repositories/i-role-permission.repository';
import { IUserRoleRepository } from '../../domain/repositories/i-user-role.repository';
import { IPermissionResolverService } from '../interfaces/i-permission-resolver.service';
import { AuthFailures } from '../../domain/errors/auth.failures';

export interface AssignPermissionToRoleParams {
  roleId: number;
  permissionId: number;
}

export interface AssignPermissionToRoleResult {
  success: true;
}

@Injectable()
export class AssignPermissionToRoleUseCase
  implements Usecase<AssignPermissionToRoleResult, AssignPermissionToRoleParams>
{
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepo: IRoleRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepo: IPermissionRepository,
    @Inject('IRolePermissionRepository')
    private readonly rolePermissionRepo: IRolePermissionRepository,
    @Inject('IUserRoleRepository')
    private readonly userRoleRepo: IUserRoleRepository,
    @Inject('IPermissionResolverService')
    private readonly permissionResolver: IPermissionResolverService,
  ) {}

  async execute(
    params: AssignPermissionToRoleParams,
  ): Promise<Either<Failure, AssignPermissionToRoleResult>> {
    const role = await this.roleRepo.findById(params.roleId);
    if (!role) return left(AuthFailures.roleNotFound());
    const permission = await this.permissionRepo.findById(params.permissionId);
    if (!permission) return left(AuthFailures.permissionNotFound());
    const exists = await this.rolePermissionRepo.exists(
      params.roleId,
      params.permissionId,
    );
    if (exists) return left(AuthFailures.alreadyAssigned());
    await this.rolePermissionRepo.assign(params.roleId, params.permissionId);
    const userIds = await this.userRoleRepo.findUserIdsByRoleId(params.roleId);
    userIds.forEach((uid) => this.permissionResolver.invalidate(uid));
    return right({ success: true as const });
  }
}
