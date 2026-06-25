import { Inject, Injectable } from '@nestjs/common';
import { Either, Failure, Usecase, left, right } from '@learning-hub/core';
import { IPermissionRepository } from '../../domain/repositories/i-permission.repository';
import { AuthFailures } from '../../domain/errors/auth.failures';

export interface DeletePermissionParams { id: number; }
export interface DeletePermissionResult { success: true; }

@Injectable()
export class DeletePermissionUseCase implements Usecase<DeletePermissionResult, DeletePermissionParams> {
  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionRepo: IPermissionRepository,
  ) {}

  async execute(params: DeletePermissionParams): Promise<Either<Failure, DeletePermissionResult>> {
    const permission = await this.permissionRepo.findById(params.id);
    if (!permission) return left(AuthFailures.permissionNotFound());
    await this.permissionRepo.delete(params.id);
    return right({ success: true as const });
  }
}
