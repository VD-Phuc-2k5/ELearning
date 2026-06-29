import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export interface RemovePermissionFromRoleParams {
  roleId: number;
  permissionId: number;
}

export class RemovePermissionFromRoleUsecase implements Usecase<void, RemovePermissionFromRoleParams> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: RemovePermissionFromRoleParams): Promise<Either<Failure, void>> {
    return this.repository.removePermissionFromRole(params.roleId, params.permissionId)
  }
}
