import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export interface GrantUserPermissionParams {
  userId: string;
  permissionId: number;
  isGranted: boolean;
}

export class GrantUserPermissionUsecase
  implements Usecase<void, GrantUserPermissionParams>
{
  constructor(private repository: IAuthRepository) {}
  async execute(
    params: GrantUserPermissionParams,
  ): Promise<Either<Failure, void>> {
    return this.repository.grantUserPermission(params.userId, {
      permissionId: params.permissionId,
      isGranted: params.isGranted,
    });
  }
}
