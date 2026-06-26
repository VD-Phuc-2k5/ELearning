import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class AssignPermissionToRoleUsecase implements Usecase<void, any> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: any): Promise<Either<Failure, void>> {
    return this.repository.assignPermissionToRole(params.roleId, params.permissionId)
  }
}
