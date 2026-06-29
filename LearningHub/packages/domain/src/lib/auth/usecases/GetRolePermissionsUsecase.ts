import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export interface GetRolePermissionsParams {
  roleId: number;
}

export class GetRolePermissionsUsecase implements Usecase<number[], GetRolePermissionsParams> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: GetRolePermissionsParams): Promise<Either<Failure, number[]>> {
    return this.repository.getRolePermissions(params.roleId)
  }
}
