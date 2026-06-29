import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export interface RevokeUserPermissionParams {
  userId: string;
  permissionId: number;
}

export class RevokeUserPermissionUsecase implements Usecase<void, RevokeUserPermissionParams> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: RevokeUserPermissionParams): Promise<Either<Failure, void>> {
    return this.repository.revokeUserPermission(params.userId, params.permissionId)
  }
}
