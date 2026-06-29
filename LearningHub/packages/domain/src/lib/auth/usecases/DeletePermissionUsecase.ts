import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export interface DeletePermissionParams {
  id: number;
}

export class DeletePermissionUsecase implements Usecase<void, DeletePermissionParams> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: DeletePermissionParams): Promise<Either<Failure, void>> {
    return this.repository.deletePermission(params.id)
  }
}
