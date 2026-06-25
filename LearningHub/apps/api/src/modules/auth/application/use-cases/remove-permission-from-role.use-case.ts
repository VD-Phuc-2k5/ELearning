import { Inject, Injectable } from '@nestjs/common';
import { Either, Failure, Usecase, left, right } from '@learning-hub/core';
import { IRoleRepository } from '../../domain/repositories/i-role.repository';
import { IRolePermissionRepository } from '../../domain/repositories/i-role-permission.repository';
import { AuthFailures } from '../../domain/errors/auth.failures';

export interface RemovePermissionFromRoleParams {
  roleId: number;
  permissionId: number;
}

export interface RemovePermissionFromRoleResult { success: true; }

@Injectable()
export class RemovePermissionFromRoleUseCase implements Usecase<RemovePermissionFromRoleResult, RemovePermissionFromRoleParams> {
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepo: IRoleRepository,
    @Inject('IRolePermissionRepository')
    private readonly rolePermissionRepo: IRolePermissionRepository,
  ) {}

  async execute(
    params: RemovePermissionFromRoleParams,
  ): Promise<Either<Failure, RemovePermissionFromRoleResult>> {
    const role = await this.roleRepo.findById(params.roleId);
    if (!role) return left(AuthFailures.roleNotFound());
    await this.rolePermissionRepo.remove(params.roleId, params.permissionId);
    return right({ success: true as const });
  }
}
