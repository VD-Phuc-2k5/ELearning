import { Inject, Injectable } from '@nestjs/common';
import { Either, Failure, Usecase, left, right } from '@learning-hub/core';
import { IUserRepository } from '../../domain/repositories/i-user.repository';
import { IPermissionRepository } from '../../domain/repositories/i-permission.repository';
import { IUserPermissionRepository } from '../../domain/repositories/i-user-permission.repository';
import { IPermissionResolverService } from '../interfaces/i-permission-resolver.service';
import { UserPermission } from '../../domain/entities/user-permission.entity';
import { AuthFailures } from '../../domain/errors/auth.failures';

export interface GrantUserPermissionParams {
  userId: string;
  permissionId: number;
  isGranted: boolean;
  grantedBy: string;
}

export interface GrantUserPermissionResult {
  userPermission: UserPermission;
}

@Injectable()
export class GrantUserPermissionUseCase
  implements Usecase<GrantUserPermissionResult, GrantUserPermissionParams>
{
  constructor(
    @Inject('IUserRepository')
    private readonly userRepo: IUserRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepo: IPermissionRepository,
    @Inject('IUserPermissionRepository')
    private readonly userPermissionRepo: IUserPermissionRepository,
    @Inject('IPermissionResolverService')
    private readonly permissionResolver: IPermissionResolverService,
  ) {}

  async execute(
    params: GrantUserPermissionParams,
  ): Promise<Either<Failure, GrantUserPermissionResult>> {
    if (params.userId === params.grantedBy)
      return left(AuthFailures.selfPermissionGrant());
    const [targetPerms, actorPerms] = await Promise.all([
      this.permissionResolver.getEffectivePermissions(params.userId),
      this.permissionResolver.getEffectivePermissions(params.grantedBy),
    ]);
    if (targetPerms.has('*') && !actorPerms.has('*'))
      return left(AuthFailures.cannotModifyOwner());
    const user = await this.userRepo.findById(params.userId);
    if (!user) return left(AuthFailures.userNotFound());
    const permission = await this.permissionRepo.findById(params.permissionId);
    if (!permission) return left(AuthFailures.permissionNotFound());
    const result = await this.userPermissionRepo.upsert(
      params.userId,
      params.permissionId,
      params.isGranted,
      params.grantedBy,
    );
    this.permissionResolver.invalidate(params.userId);
    return right({ userPermission: result });
  }
}
