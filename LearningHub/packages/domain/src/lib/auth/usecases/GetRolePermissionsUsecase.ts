import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class GetRolePermissionsUsecase implements Usecase<number[], any> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: any): Promise<Either<Failure, number[]>> {
    return this.repository.getRolePermissions(params.roleId)
  }
}
