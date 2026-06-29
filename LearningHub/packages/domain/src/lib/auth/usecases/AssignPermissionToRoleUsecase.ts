import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export interface AssignPermissionToRoleParams {
  roleId: number;
  permissionId: number;
}

export class AssignPermissionToRoleUsecase implements Usecase<void, AssignPermissionToRoleParams> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: AssignPermissionToRoleParams): Promise<Either<Failure, void>> {
    return this.repository.assignPermissionToRole(params.roleId, params.permissionId)
  }
}
