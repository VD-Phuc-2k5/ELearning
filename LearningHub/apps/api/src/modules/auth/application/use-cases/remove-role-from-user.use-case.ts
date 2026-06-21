import { Inject, Injectable } from '@nestjs/common';
import { Either, Failure, Usecase, left, right } from '@learning-hub/core';
import { IUserRoleRepository } from '../../domain/repositories/i-user-role.repository';
import { IPermissionResolverService } from '../interfaces/i-permission-resolver.service';
import { AuthFailures } from '../../domain/errors/auth.failures';

export interface RemoveRoleFromUserParams {
  userId: string;
  roleId: number;
  actorId: string;
}

export interface RemoveRoleFromUserResult {
  success: true;
}

@Injectable()
export class RemoveRoleFromUserUseCase
  implements Usecase<RemoveRoleFromUserResult, RemoveRoleFromUserParams>
{
  constructor(
    @Inject('IUserRoleRepository')
    private readonly userRoleRepo: IUserRoleRepository,
    @Inject('IPermissionResolverService')
    private readonly permissionResolver: IPermissionResolverService,
  ) {}

  async execute(
    params: RemoveRoleFromUserParams,
  ): Promise<Either<Failure, RemoveRoleFromUserResult>> {
    const [targetPerms, actorPerms] = await Promise.all([
      this.permissionResolver.getEffectivePermissions(params.userId),
      this.permissionResolver.getEffectivePermissions(params.actorId),
    ]);
    if (targetPerms.has('*') && !actorPerms.has('*'))
      return left(AuthFailures.cannotModifyOwner());
    await this.userRoleRepo.remove(params.userId, params.roleId);
    this.permissionResolver.invalidate(params.userId);
    return right({ success: true as const });
  }
}
