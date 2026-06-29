import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export interface DeleteRoleParams {
  id: number;
}

export class DeleteRoleUsecase implements Usecase<void, DeleteRoleParams> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: DeleteRoleParams): Promise<Either<Failure, void>> {
    return this.repository.deleteRole(params.id)
  }
}
