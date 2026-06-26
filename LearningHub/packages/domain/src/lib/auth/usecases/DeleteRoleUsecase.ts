import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class DeleteRoleUsecase implements Usecase<void, any> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: any): Promise<Either<Failure, void>> {
    return this.repository.deleteRole(params.id)
  }
}
