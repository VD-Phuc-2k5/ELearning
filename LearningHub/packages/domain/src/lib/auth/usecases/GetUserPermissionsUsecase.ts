import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export interface GetUserPermissionsParams {
  userId: string;
}

export class GetUserPermissionsUsecase implements Usecase<import('../entities/entities').Permission[], GetUserPermissionsParams> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: GetUserPermissionsParams): Promise<Either<Failure, import('../entities/entities').Permission[]>> {
    return this.repository.getUserPermissions(params.userId)
  }
}
